import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { EventBus } from '../../../../shared/application/events';

export class UploadPaymentProof {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, data: {
    url: string;
    nombreOriginal: string;
    mime: string;
    tamaño: number;
    cargadoPorId: string;
    estado: string;
    observaciones?: string;
  }, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.canAcceptPaymentProof()) {
      throw new Error('El pedido no puede recibir comprobantes de pago');
    }

    const updatedOrder = await this.orderRepo.updatePaymentProof(id, data);

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId: data.cargadoPorId,
      accion: 'COMPROBANTE_CARGADO',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
      informacion: { url: data.url, nombreOriginal: data.nombreOriginal, mime: data.mime },
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.payment_proof.uploaded',
        occurredAt: new Date(),
        payload: {
          orderId: updatedOrder.id,
          orderNumero: updatedOrder.numero,
          clienteId: updatedOrder.clienteId,
          clienteNombre: updatedOrder.cliente,
          asesorId: updatedOrder.asesorId,
          asesorNombre: updatedOrder.asesor,
        },
        requestId,
      });
    }

    return updatedOrder;
  }
}
