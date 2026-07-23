import { describe, it, expect, vi } from 'vitest';
import { GetNotifications, GetNotificationById, MarkNotificationAsRead, NotificationSubscriber } from '@/modules/notifications/application/use-cases/NotificationUseCases';
import type { NotificationRepository, NotificationFilters } from '@/modules/notifications/domain/repositories/NotificationRepository';
import type { EventBus } from '@/modules/shared/application/EventBus';

const mockRepo: jest.Mocked<NotificationRepository> = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  markAsRead: vi.fn(),
};

const mockEventBus: jest.Mocked<EventBus> = {
  publish: vi.fn(),
  subscribe: vi.fn(),
};

describe('GetNotifications', () => {
  it('should list notifications', async () => {
    mockRepo.list.mockResolvedValue([{ id: '1', titulo: 'Test' } as any]);
    const useCase = new GetNotifications(mockRepo);
    const result = await useCase.execute({ leida: false } as NotificationFilters);
    expect(result).toHaveLength(1);
  });
});

describe('GetNotificationById', () => {
  it('should get notification by id', async () => {
    mockRepo.getById.mockResolvedValue({ id: '1', titulo: 'Test' } as any);
    const useCase = new GetNotificationById(mockRepo);
    const result = await useCase.execute('1');
    expect(result.titulo).toBe('Test');
  });

  it('should throw if not found', async () => {
    mockRepo.getById.mockResolvedValue(null as any);
    const useCase = new GetNotificationById(mockRepo);
    await expect(useCase.execute('1')).rejects.toThrow('Notificación no encontrada');
  });
});

describe('MarkNotificationAsRead', () => {
  it('should mark as read', async () => {
    mockRepo.markAsRead.mockResolvedValue(undefined as any);
    const useCase = new MarkNotificationAsRead(mockRepo);
    await useCase.execute('1');
    expect(mockRepo.markAsRead).toHaveBeenCalledWith('1');
  });
});

describe('NotificationSubscriber', () => {
  it('should register handlers for events', () => {
    const subscriber = new NotificationSubscriber(mockRepo);
    subscriber.register(mockEventBus);

    expect(mockEventBus.subscribe).toHaveBeenCalledWith('order.created', expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('order.status.updated', expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('stock.below_minimum', expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('production.completed', expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('order.delivered', expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('order.canceled', expect.any(Function));
  });

  it('should create notification on order.created', async () => {
    const subscriber = new NotificationSubscriber(mockRepo);
    subscriber.register(mockEventBus);

    const handler = mockEventBus.subscribe.mock.calls.find(([type]) => type === 'order.created')?.[1];
    if (handler) {
      await handler({
        type: 'order.created',
        payload: {
          orderId: '1',
          orderNumero: 'PED-000001',
          clienteId: 'cli1',
          clienteNombre: 'Juan',
          asesorId: 'asesor1',
          asesorNombre: 'Asesor',
          total: 50000,
          itemsCount: 2,
        },
        occurredAt: new Date(),
      });
      expect(mockRepo.create).toHaveBeenCalledWith({
        tipo: 'SUCCESS',
        titulo: 'Nuevo pedido creado',
        mensaje: expect.stringContaining('PED-000001'),
        usuarioId: 'asesor1',
      });
    }
  });

  it('should create notification on order.status.updated', async () => {
    const subscriber = new NotificationSubscriber(mockRepo);
    subscriber.register(mockEventBus);

    const handler = mockEventBus.subscribe.mock.calls.find(([type]) => type === 'order.status.updated')?.[1];
    if (handler) {
      await handler({
        type: 'order.status.updated',
        payload: {
          orderId: '1',
          orderNumero: 'PED-000001',
          previousStatus: 'Nuevo',
          newStatus: 'Entregado',
          clienteId: 'cli1',
          clienteNombre: 'Juan',
          asesorId: 'asesor1',
          asesorNombre: 'Asesor',
        },
        occurredAt: new Date(),
      });
      expect(mockRepo.create).toHaveBeenCalledWith({
        tipo: 'SUCCESS',
        titulo: 'Pedido PED-000001 actualizado',
        mensaje: expect.stringContaining('Entregado'),
        usuarioId: 'asesor1',
      });
    }
  });
});
