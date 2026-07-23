import { describe, it, expect, vi } from 'vitest';
import { PrismaNotificationRepository } from '@/modules/notifications/infrastructure/repositories/prismaNotificationRepository';
import { NotFoundError } from '@/shared/domain/errors';

const mockPrisma = {
  notification: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaNotificationRepository(mockPrisma as any);

const row = (overrides = {}) => ({
  id: 'n-1',
  tipo: 'INFO',
  titulo: 'Hola',
  mensaje: 'Mensaje',
  leida: false,
  usuarioId: 'u-1',
  createdAt: new Date(),
  ...overrides,
});

describe('PrismaNotificationRepository', () => {
  it('lists notifications with filters', async () => {
    mockPrisma.$transaction.mockResolvedValue([[row()], 1]);
    const result = await repo.list({ usuarioId: 'u-1', leida: false, page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });
  });

  it('lists notifications with cursor pagination', async () => {
    const rows = Array.from({ length: 11 }, (_, i) => row({ id: `n-${i}` }));
    mockPrisma.$transaction.mockResolvedValue([rows, 11]);
    const result = await repo.list({ usuarioId: 'u-1', limit: 10, order: 'asc', cursor: Buffer.from('n-0').toString('base64') });
    expect(result.data).toHaveLength(10);
    expect(result.meta.total).toBe(11);
    expect(result.meta.nextCursor).toBeDefined();
  });

  it('applies usuarioId and leida filters', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);
    await repo.list({ usuarioId: 'u-1', leida: true });
    const where = mockPrisma.notification.findMany.mock.calls.at(-1)![0].where;
    expect(where).toMatchObject({ deletedAt: null, usuarioId: 'u-1', leida: true });
  });

  it('gets a notification by id', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(row());
    expect((await repo.getById('n-1'))?.titulo).toBe('Hola');
  });

  it('returns null when notification not found', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);
    expect(await repo.getById('n-1')).toBeNull();
  });

  it('creates a notification', async () => {
    mockPrisma.notification.create.mockResolvedValue(row());
    const result = await repo.create({ tipo: 'INFO', titulo: 'Hola', mensaje: 'Mensaje', usuarioId: 'u-1' });
    expect(result.titulo).toBe('Hola');
    expect(mockPrisma.notification.create.mock.calls.at(-1)![0].data).toMatchObject({
      tipo: 'INFO',
      titulo: 'Hola',
      mensaje: 'Mensaje',
      usuarioId: 'u-1',
    });
  });

  it('marks a notification as read', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(row());
    mockPrisma.notification.update.mockResolvedValue(row({ leida: true }));
    const result = await repo.markAsRead('n-1');
    expect(result.leida).toBe(true);
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({ where: { id: 'n-1' }, data: { leida: true } });
  });

  it('throws NotFound when marking missing notification', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);
    await expect(repo.markAsRead('n-1')).rejects.toThrow(NotFoundError);
  });

  it('soft deletes a notification', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(row());
    mockPrisma.notification.update.mockResolvedValue({});
    await repo.delete('n-1');
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'n-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NotFound when deleting missing notification', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);
    await expect(repo.delete('n-1')).rejects.toThrow(NotFoundError);
  });
});
