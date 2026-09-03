import { NotFoundError, BadRequestError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';

/**
 * Regla de negocio: 1 VENTA = 1 PAGO CONFIRMADO.
 *
 * Por lo tanto, AcceptOrder NO crea la venta al aceptar el pedido.
 * Solo emite el recibo y notifica. La venta será creada por
 * PaymentApprovedSubscriber cuando el pago sea confirmado.
 */
export class AcceptOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
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

    // Generar el recibo (NO la venta — la venta nace del pago confirmado).
    const receiptNumero = `REC-${updatedOrder.numero?.replace('PED-', '') ?? updatedOrder.id}`;
    const receipt = await this.receiptRepo.create({
      orderId: updatedOrder.id,
      customerId: updatedOrder.clienteId,
      numero: receiptNumero,
      total: updatedOrder.total,
      concepto: `Pedido ${updatedOrder.numero ?? updatedOrder.id} - ${updatedOrder.items} ítems`,
      emitidoPor: updatedOrder.asesor,
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.accepted',
        occurredAt: new Date(),
        payload: {
          orderId: updatedOrder.id,
          orderNumero: updatedOrder.numero,
          clienteId: updatedOrder.clienteId,
          clienteNombre: updatedOrder.cliente,
          asesorId: updatedOrder.asesorId,
          asesorNombre: updatedOrder.asesor,
          receiptId: receipt.id,
          total: updatedOrder.total,
        },
        requestId,
      });
    }

    return updatedOrder;
  }
}
