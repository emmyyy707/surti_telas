import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';
import { Order } from '../../../orders/domain/entities/Order';
import { prisma } from '../../../../config/database';
import { toOrderData } from '../../../orders/infrastructure/mappers/OrderMapper';
import { logger } from '../../../../shared/infrastructure/logger';

import { BadRequestError } from '../../../../shared/domain/errors';
export class AcceptOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly saleRepo: SaleRepository,
    private readonly receiptRepo: ReceiptRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, data: {
    usuarioId: string;
    medioPago?: string;
  }, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.canBeAccepted()) {
      throw new BadRequestError('El pedido no puede ser aceptado en su estado actual');
    }

    if (!order.hasPaymentProof()) {
      throw new BadRequestError('El pedido debe tener un comprobante de pago válido');
    }

    const fechaValidacion = new Date();
    const medioPago = data.medioPago ?? order.medioPago;

    if (!medioPago) {
      throw new BadRequestError('El pedido debe tener un medio de pago definido');
    }

    const updatedOrder = await this.orderRepo.updateToAccepted(id, {
      usuarioValidacionId: data.usuarioId,
      fechaValidacion,
      medioPago,
    });

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId: data.usuarioId,
      accion: 'PEDIDO_ACEPTADO',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
      informacion: { medioPago },
    });

    const finalOrder = await this.createSaleAndReceipt(updatedOrder, data.usuarioId, medioPago, requestId);

    return finalOrder;
  }

  private async createSaleAndReceipt(order: Order, usuarioId: string, medioPago: string, requestId?: string): Promise<Order> {
    logger.info('[AcceptOrder] Iniciando creación de venta y recibo', {
      requestId,
      orderId: order.id,
      orderNumero: order.numero,
    });

    let saleId: string | undefined;
    let receiptId: string | undefined;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const sale = await this.saleRepo.create({
          orderId: order.id,
          clienteId: order.clienteId,
          clienteNombre: order.cliente,
          asesorId: order.asesorId,
          asesorNombre: order.asesor,
          fechaVenta: new Date().toISOString(),
          subtotal: order.subtotal ?? order.total,
          impuestos: order.impuestos ?? 0,
          descuentos: order.descuentos ?? 0,
          total: order.total,
          estado: 'COMPLETADA',
          medioPago,
        });
        saleId = sale.id;

        const receiptNumero = `REC-${order.numero.replace('PED-', '')}`;
        const receipt = await this.receiptRepo.create({
          orderId: order.id,
          customerId: order.clienteId,
          numero: receiptNumero,
          total: order.total,
          concepto: `Venta ${order.numero} - ${order.items} ítems`,
          emitidoPor: order.asesor,
        });
        receiptId = receipt.id;

        const updated = await tx.order.update({
          where: { id: order.id },
          data: { estado: 'RECIBO_GENERADO' },
          include: {
            cliente: true,
            asesor: true,
            usuarioValidacion: true,
            comprobantePagoCargadoPor: true,
            items: true,
          },
        });

        await tx.orderHistory.create({
          data: {
            pedidoId: order.id,
            usuarioId,
            accion: 'VENTA_REGISTRADA',
            estadoAnterior: order.estado,
            estadoNuevo: 'Recibo generado',
            informacion: { saleId: sale.id, receiptId: receipt.id },
          },
        });

        return updated;
      });

      logger.info('[AcceptOrder] Venta y recibo creados exitosamente', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
      });

      if (this.eventBus) {
        this.eventBus.publish({
          type: 'order.accepted',
          occurredAt: new Date(),
          payload: {
            orderId: order.id,
            orderNumero: order.numero,
            clienteId: order.clienteId,
            clienteNombre: order.cliente,
            asesorId: order.asesorId,
            asesorNombre: order.asesor,
            saleId: saleId!,
            receiptId: receiptId!,
            total: order.total,
          },
          requestId,
        });
      }

      return new Order(toOrderData(result));
    } catch (error) {
      logger.error('[AcceptOrder] Error creando venta y recibo', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}


