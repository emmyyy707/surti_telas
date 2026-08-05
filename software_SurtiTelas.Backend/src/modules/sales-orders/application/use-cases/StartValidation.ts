import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { EventBus } from '../../../../shared/application/events';

export class StartValidation {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, usuarioId: string, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.canBeValidated()) {
      throw new Error('El pedido no puede iniciar validación en su estado actual');
    }

    const updatedOrder = await this.orderRepo.updateStatus(id, 'Pendiente');

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId,
      accion: 'VALIDACION_INICIADA',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.status.updated',
        occurredAt: new Date(),
        payload: {
          orderId: updatedOrder.id,
          orderNumero: updatedOrder.numero,
          previousStatus: order.estado,
          newStatus: updatedOrder.estado,
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
