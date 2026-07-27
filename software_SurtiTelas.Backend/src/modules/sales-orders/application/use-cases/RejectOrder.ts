import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { RejectionReason } from '../../../orders/domain/entities/Order';
import type { EventBus } from '../../../../shared/application/events';

export class RejectOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, data: {
    usuarioId: string;
    razon: RejectionReason;
    observaciones?: string;
  }, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.canBeRejected()) {
      throw new Error('El pedido no puede ser rechazado en su estado actual');
    }

    if (data.razon === 'OTRA' && !data.observaciones?.trim()) {
      throw new Error('Las observaciones son obligatorias cuando la razón es OTRA');
    }

    const fechaValidacion = new Date();
    const updatedOrder = await this.orderRepo.updateToRejected(id, {
      usuarioValidacionId: data.usuarioId,
      fechaValidacion,
      razonRechazo: data.razon,
      observacionesRechazo: data.observaciones,
    });

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId: data.usuarioId,
      accion: 'PEDIDO_RECHAZADO',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
      razon: data.razon,
      informacion: { observaciones: data.observaciones },
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.rejected',
        occurredAt: new Date(),
        payload: {
          orderId: updatedOrder.id,
          orderNumero: updatedOrder.numero,
          clienteId: updatedOrder.clienteId,
          clienteNombre: updatedOrder.cliente,
          asesorId: updatedOrder.asesorId,
          asesorNombre: updatedOrder.asesor,
          razon: data.razon,
        },
        requestId,
      });
    }

    return updatedOrder;
  }
}
