import { Prisma, PrismaClient } from '@prisma/client';
import { Alert } from '../../domain/entities/Alert';
import type { AlertFilters, AlertRepository } from '../../domain/repositories/AlertRepository';
import { toAlertData } from '../mappers/AlertMapper';

export class PrismaAlertRepository implements AlertRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: AlertFilters = {}): Promise<{ data: Alert[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.AlertWhereInput = { deletedAt: null };
    if (filters.estado) where.estado = filters.estado;
    if (filters.modulo) where.modulo = filters.modulo;
    if (filters.prioridad) where.prioridad = filters.prioridad;
    if (filters.leida !== undefined) where.leida = filters.leida;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Record<string, 'asc' | 'desc'> = { [sort]: order };
    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.AlertWhereInput = {
        ...where,
        OR: [{ id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } }],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.alert.findMany({
          where: cursorWhere,
          orderBy: orderBy as Prisma.AlertOrderByWithRelationInput,
          take: limit + 1,
        }),
        this.prisma.alert.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Alert(toAlertData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.alert.findMany({
        where,
        orderBy: orderBy as Prisma.AlertOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Alert(toAlertData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Alert | null> {
    const row = await this.prisma.alert.findFirst({ where: { id, deletedAt: null } });
    return row ? new Alert(toAlertData(row)) : null;
  }

  async create(data: Parameters<AlertRepository['create']>[0]): Promise<Alert> {
    const row = await this.prisma.alert.create({
      data: {
        tipo: data.tipo,
        modulo: data.modulo,
        referenciaId: data.referenciaId,
        mensaje: data.mensaje,
        estado: data.estado ?? 'PENDIENTE',
        prioridad: data.prioridad ?? 'MEDIA',
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
    return new Alert(toAlertData(row));
  }

  async update(id: string, changes: Parameters<AlertRepository['update']>[1]): Promise<Alert> {
    const row = await this.prisma.alert.update({
      where: { id },
      data: {
        estado: changes.estado,
        prioridad: changes.prioridad,
        leida: changes.leida,
        leidaPorId: changes.leidaPorId,
        resueltaPorId: changes.resueltaPorId,
        resueltaEn: changes.resueltaEn,
        metadata: changes.metadata as Prisma.InputJsonValue | undefined,
      } as Prisma.AlertUpdateInput,
    });
    return new Alert(toAlertData(row));
  }
}
