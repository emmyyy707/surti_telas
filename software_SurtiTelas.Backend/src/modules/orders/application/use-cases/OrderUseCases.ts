import { NotFoundError, BadRequestError } from '../../../../shared/domain/errors';
import type { CustomerRepository } from '../../../customers/domain/repositories/CustomerRepository';
import type { ProductRepository } from '../../../catalog/domain/repositories/ProductRepository';
import type { OrderFilters, OrderRepository, CreateOrderInput } from '../../domain/repositories/OrderRepository';
import { Order, type OrderItem, type OrderPriority, type OrderStatus } from '../../domain/entities/Order';
import type { EventBus } from '../../../../shared/application/events';
import { PrismaClient, StockStatus } from '@prisma/client';
import { computeStockStatus } from '../../../catalog/domain/entities/Product';
import { STOCK_TO_DB } from '../../../catalog/infrastructure/mappers/ProductMapper';
import {
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  StockReservedEvent,
  OrderDeliveredEvent,
  OrderAcceptedEvent,
  OrderRejectedEvent,
  OrderReceiptGeneratedEvent,
  OrderCanceledEvent,
} from '../../../../shared/application/events';
import { toOrderData } from '../../infrastructure/mappers/OrderMapper';
import { logger } from '../../../../shared/infrastructure/logger';

export class CreateOrder {
  constructor(
    private readonly repo: OrderRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly productRepo: ProductRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(input: CreateOrderInput, requestId?: string, user?: { id: string; email: string; nombre?: string; role?: string }) {
    let customerId = input.clienteId;

    if (user?.role === 'CLIENTE' && user?.email) {
      const customer = await this.customerRepo.getByEmail(user.email);
      if (customer) {
        customerId = customer.id;
      } else {
        const asesor = await this.prisma.user.findFirst({
          where: { role: 'ASESOR', deletedAt: null },
          select: { id: true },
        });

        const newCustomer = await this.prisma.customer.create({
          data: {
            nombre: user.nombre ?? user.email,
            email: user.email,
            telefono: null,
            ciudad: null,
            nit: null,
            asesorId: asesor?.id ?? null,
            cupoTotal: 1000000,
            cupoUsado: 0,
            deudaVencida: 0,
            isTrustedCustomer: false,
            estado: 'ACTIVO',
          },
          include: {
            asesor: true,
            _count: { select: { orders: true } },
          },
        });

        customerId = newCustomer.id;
      }
    } else if (!customerId && user?.email) {
      const customer = await this.customerRepo.getByEmail(user.email);
      if (customer) {
        customerId = customer.id;
      } else {
        const asesor = await this.prisma.user.findFirst({
          where: { role: 'ASESOR', deletedAt: null },
          select: { id: true },
        });

        const newCustomer = await this.prisma.customer.create({
          data: {
            nombre: user.nombre ?? user.email,
            email: user.email,
            telefono: null,
            ciudad: null,
            nit: null,
            asesorId: asesor?.id ?? null,
            cupoTotal: 1000000,
            cupoUsado: 0,
            deudaVencida: 0,
            isTrustedCustomer: false,
            estado: 'ACTIVO',
          },
          include: {
            asesor: true,
            _count: { select: { orders: true } },
          },
        });

        customerId = newCustomer.id;
      }
    } else if (customerId) {
      const customer = await this.customerRepo.getById(customerId);
      if (!customer) {
        const userCustomer = await this.prisma.user.findFirst({
          where: { id: customerId, deletedAt: null },
          select: { id: true, email: true, nombre: true },
        });
        if (userCustomer?.email) {
          const existing = await this.customerRepo.getByEmail(userCustomer.email);
          if (existing) {
            customerId = existing.id;
          } else {
            const asesor = await this.prisma.user.findFirst({
              where: { role: 'ASESOR', deletedAt: null },
              select: { id: true },
            });
            const newCustomer = await this.prisma.customer.create({
              data: {
                nombre: userCustomer.nombre ?? userCustomer.email,
                email: userCustomer.email,
                telefono: null,
                ciudad: null,
                nit: null,
                asesorId: asesor?.id ?? null,
                cupoTotal: 1000000,
                cupoUsado: 0,
                deudaVencida: 0,
                isTrustedCustomer: false,
                estado: 'ACTIVO',
              },
              include: {
                asesor: true,
                _count: { select: { orders: true } },
              },
            });
            customerId = newCustomer.id;
          }
        }
      }
    }

    if (!customerId) {
      throw new NotFoundError('Cliente no encontrado');
    }

    console.log('CREATE_ORDER_CUSTOMER_ID', JSON.stringify({ customerId, inputClienteId: input.clienteId, userEmail: user?.email, userRole: user?.role }));

    const customer = await this.customerRepo.getById(customerId);
    if (!customer) throw new NotFoundError('Cliente no encontrado');

    try {
      const itemsList = input.itemsList ?? [];
      const total = itemsList.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      if (!customer.isTrustedCustomer && !customer.tieneCupoDisponible(total)) {
        throw new Error('El cliente no tiene cupo disponible para este pedido');
      }

      const stockItems: { productId: string; productRef: string; cantidad: number }[] = [];
      const productUpdates: { ref: string; cantidadStock: number; stockStatus: StockStatus }[] = [];

      for (const item of itemsList) {
        if (item.productId) {
          const product = await this.productRepo.getById(item.productId);
          if (product) {
            const newStock = Math.max(0, product.cantidadStock - item.cantidad);
            const newStockStatus = computeStockStatus(newStock);
            productUpdates.push({ ref: product.ref!, cantidadStock: newStock, stockStatus: STOCK_TO_DB[newStockStatus] });
            stockItems.push({ productId: item.productId, productRef: product.ref!, cantidad: item.cantidad });
          }
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const order = await this.repo.create({
          ...input,
          clienteId: customerId,
          asesorId: input.asesorId ?? '',
        });
        await tx.customer.update({
          where: { id: customer.id! },
          data: { cupoUsado: { increment: total } },
          include: { asesor: true },
        });

        for (const update of productUpdates) {
          await tx.product.update({
            where: { ref: update.ref },
            data: { cantidadStock: update.cantidadStock, stockStatus: update.stockStatus },
          });
        }

        for (const item of itemsList) {
          if (item.productId) {
            await tx.inventoryMovement.create({
              data: {
                tipo: 'SALIDA',
                productId: item.productId,
                cantidad: item.cantidad,
                motivo: `Pedido ${order.numero || order.id}`,
                usuarioId: input.asesorId ?? requestId ?? '',
              },
            });
          }
        }

        return order;
      });

      this.emitEvents(result, total, stockItems, input.paymentMethod, input.installments, input.tipoFlujo, requestId);
      return result;
    } catch (error) {
      console.error('CREATE_ORDER_ERROR', error);
      throw error;
    }
  }

  private emitEvents(order: Order, total: number, stockItems: { productId: string; productRef: string; cantidad: number }[], paymentMethod?: string, installments?: number, tipoFlujo?: string, requestId?: string) {
    if (!this.eventBus) return;
    this.eventBus.publish(
      new StockReservedEvent({
        orderId: order.id,
        items: stockItems,
      }, requestId)
    );
    this.eventBus.publish(
      new OrderCreatedEvent({
        orderId: order.id,
        orderNumero: order.numero || order.id,
        clienteId: order.clienteId,
        clienteNombre: order.cliente,
        asesorId: order.asesorId,
        asesorNombre: order.asesor,
        total,
        itemsCount: order.items,
        paymentMethod: paymentMethod || 'OTHER',
        installments,
        tipoFlujo,
      }, requestId)
    );
  }
}

export class GetOrders {
  constructor(private readonly repo: OrderRepository) {}
  execute(filters?: OrderFilters) {
    return this.repo.list(filters);
  }
}

export class GetOrderById {
  constructor(private readonly repo: OrderRepository) {}
  async execute(id: string) {
    const order = await this.repo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    return order;
  }
}

export class UpdateOrderStatus {
  constructor(
    private readonly repo: OrderRepository,
    private readonly eventBus?: EventBus,
    private readonly prisma?: PrismaClient,
  ) {}

  async execute(id: string, estado: OrderStatus, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    const previousStatus = existing.estado;
    if (!existing.canTransitionTo(estado)) {
      throw new BadRequestError(`No se puede transitar de '${existing.estado}' a '${estado}'`);
    }
    const updated = await this.repo.updateStatus(id, estado);

    if (this.eventBus) {
      this.eventBus.publish(
        new OrderStatusUpdatedEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          previousStatus,
          newStatus: updated.estado,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
        }, requestId)
      );
    } else {
      logger.warn(`[UpdateOrderStatus] EventBus no disponible para pedido ${updated.id}`);
    }

    if (estado === 'Aceptado') {
      try {
        const existingReceipt = await this.repo.findReceiptByOrderId(updated.id);
        if (!existingReceipt) {
          const receipt = await this.repo.createReceipt({
            orderId: updated.id,
            customerId: updated.clienteId,
            numero: updated.numero || updated.id,
            total: Number(updated.total),
            concepto: `Pedido ${updated.numero || updated.id} - ${updated.items} ítems`,
            emitidoPor: updated.asesor,
          });
          logger.info(`[UpdateOrderStatus] Recibo generado al aceptar pedido ${updated.id}: ${receipt.id}`);
          if (this.eventBus) {
            this.eventBus.publish(
              new OrderReceiptGeneratedEvent({
                orderId: updated.id,
                orderNumero: updated.numero || updated.id,
                clienteId: updated.clienteId,
                clienteNombre: updated.cliente,
                asesorId: updated.asesorId,
                asesorNombre: updated.asesor,
                receiptId: receipt.id,
                total: Number(updated.total),
              }, requestId)
            );
          }
        } else {
          logger.info(`[UpdateOrderStatus] Recibo ya existe para pedido ${updated.id}, no se crea duplicado.`);
        }
      } catch (error) {
        logger.error(`[UpdateOrderStatus] Error generando recibo para pedido ${updated.id}`, { error: (error as Error).message });
      }
    }

    if (estado === 'Entregado') {
      const existingReceipt = await this.repo.findReceiptByOrderId(updated.id);
      if (!existingReceipt) {
        const receipt = await this.repo.createReceipt({
          orderId: updated.id,
          customerId: updated.clienteId,
          numero: `REC-${updated.numero?.replace('PED-', '') || updated.id}`,
          total: Number(updated.total),
          concepto: `Pedido ${updated.numero || updated.id} - ${updated.items} ítems`,
          emitidoPor: updated.asesor,
        });
        this.eventBus?.publish(
          new OrderReceiptGeneratedEvent({
            orderId: updated.id,
            orderNumero: updated.numero || updated.id,
            clienteId: updated.clienteId,
            clienteNombre: updated.cliente,
            asesorId: updated.asesorId,
            asesorNombre: updated.asesor,
            receiptId: receipt.id,
            total: Number(updated.total),
          }, requestId)
        );
      }
      logger.info(`[UpdateOrderStatus] Publicando evento order.delivered para pedido ${updated.id}`);
      this.eventBus?.publish(
        new OrderDeliveredEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
          total: Number(updated.total),
        }, requestId)
      );

      if (this.prisma) {
        try {
          const existingPayment = await this.prisma.payment.findFirst({
            where: { orderId: updated.id, deletedAt: null },
          });

          if (existingPayment) {
            if (existingPayment.status !== 'APPROVED') {
              await this.prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: 'APPROVED',
                  amount: Number(updated.total),
                  paidAt: new Date(),
                },
              });
              logger.info(`[UpdateOrderStatus] Pago actualizado a APPROVED para pedido ${updated.id}: ${existingPayment.id}`);
            }
          } else {
            await this.prisma.payment.create({
              data: {
                orderId: updated.id,
                customerId: updated.clienteId,
                asesorId: updated.asesorId || undefined,
                amount: Number(updated.total),
                method: 'OTHER',
                status: 'APPROVED',
                paidAt: new Date(),
                notes: 'Pago completado por entrega del pedido',
              },
            });
            logger.info(`[UpdateOrderStatus] Pago generado por entrega para pedido ${updated.id}`);
          }
        } catch (error) {
          logger.error(`[UpdateOrderStatus] Error generando pago por entrega para pedido ${updated.id}`, { error: (error as Error).message });
        }
      }
    }

    if (estado === 'Rechazado') {
      this.eventBus?.publish(
        new OrderRejectedEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
          razon: updated.razonRechazo || 'Pedido rechazado',
        }, requestId)
      );
    }

    return updated;
  }
}

export class AssignDomiciliario {
  constructor(private readonly repo: OrderRepository) {}
  async execute(id: string, domiciliarioId: string) {
    const order = await this.repo.assignDomiciliario(id, domiciliarioId);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    return order;
  }
}

export class DeleteOrder {
  constructor(private readonly repo: OrderRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    await this.repo.softDelete(id);
  }
}

export class UpdateOrderFull {
  constructor(private readonly repo: OrderRepository) {}
  async execute(id: string, changes: { clienteId?: string; asesorId?: string; prioridad?: OrderPriority; observaciones?: string; itemsList?: OrderItem[] }) {
    const order = await this.repo.updateFull(id, changes);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    return order;
  }
}

export class ApproveOrder {
  constructor(private readonly repo: OrderRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, usuarioValidacionId: string, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    const order = new Order(toOrderData(existing as any));
    if (!order.canBeAccepted()) {
      throw new BadRequestError('El pedido no puede ser aceptado en su estado actual');
    }

    const updated = await this.repo.updateValidation(id, {
      usuarioValidacionId,
      fechaValidacion: new Date(),
      estado: 'Aceptado',
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new OrderAcceptedEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
          saleId: updated.id,
          receiptId: updated.id,
          total: Number(updated.total),
        }, requestId)
      );
    }

    return updated;
  }
}

export class RejectOrder {
  constructor(private readonly repo: OrderRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, usuarioValidacionId: string, razonRechazo: string, observacionesRechazo?: string, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    const order = new Order(toOrderData(existing as any));
    if (!order.canBeRejected()) {
      throw new BadRequestError('El pedido no puede ser rechazado en su estado actual');
    }

    const updated = await this.repo.updateValidation(id, {
      usuarioValidacionId,
      fechaValidacion: new Date(),
      estado: 'Rechazado',
      razonRechazo,
      observacionesRechazo,
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new OrderRejectedEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
          razon: razonRechazo,
        }, requestId)
      );
    }

    return updated;
  }
}

export class UploadPaymentProof {
  constructor(private readonly repo: OrderRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, data: { url: string; nombreOriginal: string; mime: string; tamaño: number; cargadoPorId: string; estado: string; observaciones?: string }, requestId?: string) {
    const updated = await this.repo.uploadPaymentProof(id, data);
    if (this.eventBus) {
      this.eventBus.publish(
        new OrderStatusUpdatedEvent({
          orderId: updated.id,
          orderNumero: updated.numero || updated.id,
          previousStatus: updated.estado,
          newStatus: updated.estado,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          asesorId: updated.asesorId,
          asesorNombre: updated.asesor,
        }, requestId)
      );
    }
    return updated;
  }
}

export class CancelOrder {
  constructor(private readonly repo: OrderRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    const order = new Order(toOrderData(existing as any));
    if (!order.canBeCanceled()) {
      throw new BadRequestError('El pedido no puede ser cancelado en su estado actual');
    }

    const updated = await this.repo.updateStatus(id, 'Rechazado');

    if (this.eventBus) {
      const items = (updated.itemsList ?? []).map((i) => ({
        productId: i.productId ?? '',
        productRef: i.productId ?? '',
        cantidad: i.cantidad,
      }));
      this.eventBus.publish(
        new OrderCanceledEvent({
          orderId: updated.id,
          clienteId: updated.clienteId,
          clienteNombre: updated.cliente,
          total: Number(updated.total),
          items,
        }, requestId)
      );
    }

    return updated;
  }
}
