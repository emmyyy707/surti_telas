import { describe, it, expect, vi } from 'vitest';
import { GetNotifications } from '@/modules/notifications/application/use-cases/NotificationUseCases';
import type { NotificationRepository } from '@/modules/notifications/domain/repositories/NotificationRepository';

describe('GetNotifications', () => {
  it('should return paginated notifications for user', async () => {
    const notifications = [
      {
        id: '1',
        tipo: 'SUCCESS',
        titulo: 'Pedido creado',
        mensaje: 'Test',
        leida: false,
        usuarioId: 'user1',
      },
    ];

    const repo: jest.Mocked<NotificationRepository> = {
      list: vi.fn().mockResolvedValue({
        data: notifications as any,
        meta: { total: 1, page: 1, limit: 50 },
      }),
      getById: vi.fn(),
      create: vi.fn(),
      markAsRead: vi.fn(),
    };

    const useCase = new GetNotifications(repo);
    const result = await useCase.execute({ usuarioId: 'user1', page: 1, limit: 50 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].usuarioId).toBe('user1');
    expect(result.meta.total).toBe(1);
  });
});
