import { eventBus } from '../../../../shared/application/events/eventBus';
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

export function registerIntegrationSubscribers(): void {
  eventBus.subscribe('order.created', async (event) => {
    const payload = event.payload as { orderId: string; orderNumero: string; clienteId: string; asesorId: string; total: number };
    logger.info('[Integration] Order created, notifying Asesor and Admin', { orderId: payload.orderId, asesorId: payload.asesorId });
  });

  eventBus.subscribe('order.status.updated', async (event) => {
    const payload = event.payload as { orderId: string; previousStatus: string; newStatus: string };
    logger.info('[Integration] Order status updated', { orderId: payload.orderId, newStatus: payload.newStatus });
  });

  eventBus.subscribe('order.delivered', async (event) => {
    const payload = event.payload as { orderId: string; deliveredAt: string };
    logger.info('[Integration] Order delivered, releasing commission', { orderId: payload.orderId });
    const order = await prisma.order.findUnique({ where: { id: payload.orderId, deletedAt: null } });
    if (order?.asesorId) {
      await prisma.commission.updateMany({
        where: { asesorId: order.asesorId, orderId: payload.orderId, estado: 'pendiente' },
        data: { estado: 'pagado' },
      });
    }
  });

  eventBus.subscribe('stock.below_minimum', async (event) => {
    const payload = event.payload as { productId: string; productName: string };
    logger.info('[Integration] Stock below minimum, alerting Admin and Asesor', { productId: payload.productId, productName: payload.productName });
  });

  eventBus.subscribe('payment.completed', async (event) => {
    const payload = event.payload as { orderId: string; amount: number; paymentMethod: string };
    logger.info('[Integration] Payment completed, recalculating commissions', { orderId: payload.orderId });
  });

  logger.info('[Integration] Registered 5 integration subscribers');
}
