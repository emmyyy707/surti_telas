import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { WebhookSubscription } from '../../domain/entities/WebhookSubscription';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookFilters,
  WebhookSubscriptionRepository,
} from '../../domain/repositories/WebhookSubscriptionRepository';

export class PrismaWebhookSubscriptionRepository implements WebhookSubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: WebhookFilters = {}): Promise<{ data: WebhookSubscription[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.WebhookSubscriptionWhereInput = { deletedAt: null };
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.active !== undefined) where.active = filters.active;

    const limit = filters.limit ?? 50;
    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.WebhookSubscriptionWhereInput = {
        ...where,
        OR: [{ id: { gt: cursorId } }],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.webhookSubscription.findMany({
          where: cursorWhere,
          orderBy: { createdAt: 'desc' },
          take: limit + 1,
        }),
        this.prisma.webhookSubscription.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new WebhookSubscription({
          id: r.id,
          url: r.url,
          secret: r.secret ?? undefined,
          events: r.events,
          active: r.active,
          usuarioId: r.usuarioId ?? undefined,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          deletedAt: r.deletedAt ?? undefined,
        })),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.webhookSubscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.webhookSubscription.count({ where }),
    ]);

    return {
      data: rows.map((r) => new WebhookSubscription({
        id: r.id,
        url: r.url,
        secret: r.secret ?? undefined,
        events: r.events,
        active: r.active,
        usuarioId: r.usuarioId ?? undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        deletedAt: r.deletedAt ?? undefined,
      })),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<WebhookSubscription | null> {
    const row = await this.prisma.webhookSubscription.findFirst({ where: { id, deletedAt: null } });
    if (!row) return null;
    return new WebhookSubscription({
      id: row.id,
      url: row.url,
      secret: row.secret ?? undefined,
      events: row.events,
      active: row.active,
      usuarioId: row.usuarioId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    });
  }

  async create(input: CreateWebhookInput): Promise<WebhookSubscription> {
    const row = await this.prisma.webhookSubscription.create({
      data: {
        url: input.url,
        secret: input.secret,
        events: input.events,
        usuarioId: input.usuarioId,
      },
    });
    return new WebhookSubscription({
      id: row.id,
      url: row.url,
      secret: row.secret ?? undefined,
      events: row.events,
      active: row.active,
      usuarioId: row.usuarioId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    });
  }

  async update(id: string, changes: UpdateWebhookInput): Promise<WebhookSubscription> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Webhook no encontrado');

    const row = await this.prisma.webhookSubscription.update({
      where: { id },
      data: {
        url: changes.url,
        secret: changes.secret,
        events: changes.events,
        active: changes.active,
      },
    });
    return new WebhookSubscription({
      id: row.id,
      url: row.url,
      secret: row.secret ?? undefined,
      events: row.events,
      active: row.active,
      usuarioId: row.usuarioId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Webhook no encontrado');
    await this.prisma.webhookSubscription.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
