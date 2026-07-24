import { NotFoundError } from '../../../../shared/domain/errors';
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
  OrderCanceledEvent,
} from '../../../../shared/application/events';

export class CreateOrder {
  constructor(
    private readonly repo: OrderRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly productRepo: ProductRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(input: CreateOrderInput, requestId?: string) {
    const customer = await this.customerRepo.getById(input.clienteId);
    if (!customer) throw new NotFoundError('Cliente no encontrado');

    const itemsList = input.itemsList ?? [];
    const total = itemsList.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    if (!customer.tieneCupoDisponible(total)) {
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
      const order = await this.repo.create({ ...input, itemsList });
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
              usuarioId: input.asesorId,
            },
          });
        }
      }

      return order;
    });

    this.emitEvents(result, total, stockItems, input.paymentMethod, input.installments, requestId);
    return result;
  }

  private emitEvents(order: Order, total: number, stockItems: { productId: string; productRef: string; cantidad: number }[], paymentMethod?: string, installments?: number, requestId?: string) {
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
  ) {}

  async execute(id: string, estado: OrderStatus, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    const previousStatus = existing.estado;
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

      if (estado === 'Entregado') {
        this.eventBus.publish(
          new OrderDeliveredEvent({
            orderId: updated.id,
            clienteId: updated.clienteId,
            clienteNombre: updated.cliente,
            total: Number(updated.total),
          }, requestId)
        );
      }

      if (estado === 'Cancelado') {
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
