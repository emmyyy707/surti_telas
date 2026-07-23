import { describe, it, expect, vi } from 'vitest';
import { MarkNotificationAsRead } from '@/modules/notifications/application/use-cases/NotificationUseCases';
import type { NotificationRepository } from '@/modules/notifications/domain/repositories/NotificationRepository';

describe('MarkNotificationAsRead', () => {
  it('should mark notification as read', async () => {
    const notification = {
      id: '1',
      tipo: 'SUCCESS',
      titulo: 'Test',
      mensaje: 'Test',
      leida: false,
    };

    const read = {
      ...notification,
      leida: true,
    };

    const repo: jest.Mocked<NotificationRepository> = {
      markAsRead: vi.fn().mockResolvedValue(read as any),
      list: vi.fn(),
      getById: vi.fn().mockResolvedValue(notification as any),
      create: vi.fn(),
    };

    const useCase = new MarkNotificationAsRead(repo);
    const result = await useCase.execute('1');

    expect(result.leida).toBe(true);
    expect(repo.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should throw error if notification not found', async () => {
    const repo: jest.Mocked<NotificationRepository> = {
      markAsRead: vi.fn().mockRejectedValue(new Error('Notificación no encontrada')),
      list: vi.fn(),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    };

    const useCase = new MarkNotificationAsRead(repo);
    await expect(useCase.execute('999')).rejects.toThrow('Notificación no encontrada');
  });
});
