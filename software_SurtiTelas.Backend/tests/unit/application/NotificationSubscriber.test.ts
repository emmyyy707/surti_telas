import { describe, it, expect, vi } from 'vitest';
import { NotificationSubscriber } from '@/modules/notifications/application/use-cases/NotificationUseCases';
import type { NotificationRepository } from '@/modules/notifications/domain/repositories/NotificationRepository';
import type { EventBus } from '@/modules/shared/application/events';

describe('NotificationSubscriber', () => {
  it('should create notification on order.created event', async () => {
    const repo: jest.Mocked<NotificationRepository> = {
      create: vi.fn().mockResolvedValue({
        id: '1',
        tipo: 'SUCCESS',
        titulo: 'Nuevo pedido creado',
        mensaje: 'Pedido test',
        leida: false,
      } as any),
      list: vi.fn(),
      getById: vi.fn(),
      markAsRead: vi.fn(),
    };

    const eventBus: EventBus = {
      publish: vi.fn(),
      subscribe: vi.fn(),
    } as any;

    const subscriber = new NotificationSubscriber(repo);
    subscriber.register(eventBus);

    const handler = eventBus.subscribe.mock.calls.find((call) => call[0] === 'order.created')?.[1];
    if (handler) {
      await handler({
        type: 'order.created',
        occurredAt: new Date(),
        payload: {
          orderId: '1',
          orderNumero: 'PED-000001',
          clienteId: '1',
          clienteNombre: 'Juan',
          asesorId: '2',
          asesorNombre: 'Asesor',
          total: 50000,
          itemsCount: 2,
        },
      });
    }

    expect(repo.create).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'SUCCESS',
        titulo: 'Nuevo pedido creado',
      })
    );
  });
});
