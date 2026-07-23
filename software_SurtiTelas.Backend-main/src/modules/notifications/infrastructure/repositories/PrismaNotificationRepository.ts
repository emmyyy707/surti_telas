import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationFilters, NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { toNotificationData } from '../mappers/NotificationMapper';

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: NotificationFilters = {}): Promise<{ data: Notification[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.NotificationWhereInput = { deletedAt: null };
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.leida !== undefined) where.leida = filters.leida;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Record<string, 'asc' | 'desc'> = { [sort]: order };
    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.NotificationWhereInput = {
        ...where,
        OR: [{ id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } }],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where: cursorWhere,
          orderBy: orderBy as Prisma.NotificationOrderByWithRelationInput,
          take: limit + 1,
        }),
        this.prisma.notification.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Notification(toNotificationData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: orderBy as Prisma.NotificationOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Notification(toNotificationData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Notification | null> {
    const row = await this.prisma.notification.findFirst({ where: { id, deletedAt: null } });
    return row ? new Notification(toNotificationData(row)) : null;
  }

  async create(input: { tipo: NotificationType; titulo: string; mensaje: string; usuarioId?: string }): Promise<Notification> {
    const row = await this.prisma.notification.create({
      data: {
        tipo: input.tipo,
        titulo: input.titulo,
        mensaje: input.mensaje,
        usuarioId: input.usuarioId,
      },
    });
    return new Notification(toNotificationData(row));
  }

  async markAsRead(id: string): Promise<Notification> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Notificación no encontrada');

    const row = await this.prisma.notification.update({
      where: { id },
      data: { leida: true },
    });
    return new Notification(toNotificationData(row));
  }

  async update(id: string, changes: { titulo?: string; mensaje?: string; leida?: boolean }): Promise<Notification> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Notificación no encontrada');

    const row = await this.prisma.notification.update({
      where: { id },
      data: changes,
    });
    return new Notification(toNotificationData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Notificación no encontrada');
    await this.prisma.notification.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
