import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';

export class RetryReceiptDelivery {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, usuarioId: string, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (order.estado !== 'Recibo generado') {
      throw new Error('Solo se puede reintentar el envío de recibos en estado RECIBO_GENERADO');
    }

    await this.orderRepo.updateReceiptSent(id, 'PENDIENTE', new Date(), (order as any).intentosEnvio + 1);

    const receipt = await prisma.receipt.findFirst({
      where: { orderId: id, deletedAt: null },
    });

    if (receipt) {
      await prisma.receipt.update({
        where: { id: receipt.id },
        data: {
          estadoEnvio: 'PENDIENTE',
          intentosEnvio: { increment: 1 },
        },
      });
    }

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId,
      accion: 'REENVIO_RECIBO',
      estadoAnterior: order.estado,
      estadoNuevo: order.estado,
      informacion: { receiptId: receipt?.id },
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.receipt.retry',
        occurredAt: new Date(),
        payload: {
          orderId: order.id,
          orderNumero: order.numero,
          clienteId: order.clienteId,
          clienteNombre: order.cliente,
          receiptId: receipt?.id,
        },
        requestId,
      });
    }

    return order;
  }
}
