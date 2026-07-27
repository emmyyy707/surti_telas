import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { PaymentRepository } from '../../../payments/domain/repositories/PaymentRepository';
import { Order } from '../../../orders/domain/entities/Order';
import type { EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';

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
      throw new Error('El pedido no puede ser aceptado en su estado actual');
    }

    if (!order.hasPaymentProof()) {
      throw new Error('El pedido debe tener un comprobante de pago válido');
    }

    const fechaValidacion = new Date();
    const updatedOrder = await this.orderRepo.updateToAccepted(id, {
      usuarioValidacionId: data.usuarioId,
      fechaValidacion,
      medioPago: data.medioPago,
    });

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId: data.usuarioId,
      accion: 'PEDIDO_ACEPTADO',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
      informacion: { medioPago: data.medioPago },
    });

    await this.createSaleAndReceipt(updatedOrder, data.usuarioId, requestId);

    return updatedOrder;
  }

  private async createSaleAndReceipt(order: Order, usuarioId: string, requestId?: string) {
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
      medioPago: order.medioPago,
    });

    const receiptNumero = `REC-${order.numero.replace('PED-', '')}`;
    const receipt = await this.receiptRepo.create({
      orderId: order.id,
      customerId: order.clienteId,
      numero: receiptNumero,
      total: order.total,
      concepto: `Venta ${order.numero} - ${order.items} ítems`,
      emitidoPor: order.asesor,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { estado: 'RECIBO_GENERADO' },
    });

    await this.historyRepo.create({
      pedidoId: order.id,
      usuarioId,
      accion: 'VENTA_REGISTRADA',
      estadoAnterior: order.estado,
      estadoNuevo: 'Recibo generado',
      informacion: { saleId: sale.id, receiptId: receipt.id },
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
          saleId: sale.id,
          receiptId: receipt.id,
          total: order.total,
        },
        requestId,
      });
    }
  }
}
