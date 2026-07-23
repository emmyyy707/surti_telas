import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { getNotifications, markAsRead } from '@/modules/notifications/presentation/controllers/notification.controller';

vi.mock('@/modules/notifications/infrastructure/container/notificationContainer', () => ({
  notificationUseCases: {
    getNotifications: { execute: vi.fn() },
    markAsRead: { execute: vi.fn() },
  },
}));

const mockReq = (overrides = {}) => ({ user: { id: 'user-1', role: 'ADMIN' }, query: {}, params: {}, ...overrides }) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('notification.controller', () => {
  it('should call getNotifications with user id and filters', async () => {
    const req = mockReq({ query: { page: 1, limit: 10, leida: false } });
    const res = mockRes();
    const { notificationUseCases } = await import('@/modules/notifications/infrastructure/container/notificationContainer');
    (notificationUseCases.getNotifications.execute as any).mockResolvedValue({ data: [{ id: '1' }], meta: { total: 1, page: 1, limit: 10 } });

    await getNotifications(req, res);

    expect(notificationUseCases.getNotifications.execute).toHaveBeenCalledWith({ usuarioId: 'user-1', page: 1, limit: 10, leida: false });
    expect(res.json).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    const req = mockReq({ params: { id: 'notif-1' } });
    const res = mockRes();
    const { notificationUseCases } = await import('@/modules/notifications/infrastructure/container/notificationContainer');
    (notificationUseCases.markAsRead.execute as any).mockResolvedValue({ id: 'notif-1' });

    await markAsRead(req, res);

    expect(notificationUseCases.markAsRead.execute).toHaveBeenCalledWith('notif-1');
    expect(res.json).toHaveBeenCalled();
  });
});
