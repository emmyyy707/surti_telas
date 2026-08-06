import { NotFoundError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';
import { logger } from '../../../../shared/infrastructure/logger';

import { BadRequestError } from '../../../../shared/domain/errors';
export class RetryReceiptDelivery {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    private readonly receiptRepo: ReceiptRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, usuarioId: string, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (order.estado !== 'Aceptado') {
      throw new BadRequestError('Solo se puede reintentar el envío de recibos en estado ACEPTADO');
    }

    const receipt = await this.receiptRepo.findByOrderId(id);
    if (!receipt) {
      throw new NotFoundError('No se encontró el recibo asociado a este pedido');
    }

    const intentosEnvio = (receipt.intentosEnvio ?? 0) + 1;

    logger.info('[RetryReceiptDelivery] Iniciando reintento de envío', {
      requestId,
      orderId: order.id,
      orderNumero: order.numero,
      receiptId: receipt.id,
      intentosEnvio,
    });

    try {
      await this.orderRepo.updateReceiptSent(id, 'PENDIENTE', new Date(), intentosEnvio);

      await this.historyRepo.create({
        pedidoId: id,
        usuarioId,
        accion: 'REENVIO_RECIBO',
        estadoAnterior: order.estado,
        estadoNuevo: order.estado,
        informacion: { receiptId: receipt.id, intentosEnvio },
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
            receiptId: receipt.id,
          },
          requestId,
        });
      }

      const updatedOrder = await this.orderRepo.getById(id);
      return updatedOrder!;
    } catch (error) {
      logger.error('[RetryReceiptDelivery] Error en reintento de envío', {
        requestId,
        orderId: order.id,
        receiptId: receipt.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}


