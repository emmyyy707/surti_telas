import { Request, Response, NextFunction } from 'express';
import { eventBus } from '../../../../shared/application/events/eventBus';

export const crossPanelEventEmitter = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    const statusCode = res.statusCode;
    if (statusCode === 200 || statusCode === 201) {
      const path = req.originalUrl || req.url;
      const method = req.method;
      void req.user;

      if (method === 'PATCH' && path.includes('/orders/') && path.includes('/status')) {
        void eventBus.publish({
          type: 'order.status.updated',
          occurredAt: new Date(),
          payload: {
            orderId: path.split('/').slice(-2, -1)[0] ?? '',
            previousStatus: 'unknown',
            newStatus: 'updated',
          },
        });
      }

      if (method === 'POST' && path.includes('/orders')) {
        void eventBus.publish({
          type: 'order.created',
          occurredAt: new Date(),
          payload: {
            orderId: body && typeof body === 'object' && 'id' in body ? String((body as { id: unknown }).id) : '',
            orderNumero: body && typeof body === 'object' && 'numero' in body ? String((body as { numero: unknown }).numero) : '',
            clienteId: body && typeof body === 'object' && 'clienteId' in body ? String((body as { clienteId: unknown }).clienteId) : '',
            asesorId: body && typeof body === 'object' && 'asesorId' in body ? String((body as { asesorId: unknown }).asesorId) : '',
            total: body && typeof body === 'object' && 'total' in body ? Number((body as { total: unknown }).total) || 0 : 0,
          },
        });
      }

      if (method === 'POST' && path.includes('/payments')) {
        void eventBus.publish({
          type: 'payment.completed',
          occurredAt: new Date(),
          payload: {
            orderId: body && typeof body === 'object' && 'orderId' in body ? String((body as { orderId: unknown }).orderId) : '',
            amount: body && typeof body === 'object' && 'amount' in body ? Number((body as { amount: unknown }).amount) || 0 : 0,
            paymentMethod: body && typeof body === 'object' && 'method' in body ? String((body as { method: unknown }).method) : '',
          },
        });
      }
    }
    return originalJson(body);
  };
  next();
};
