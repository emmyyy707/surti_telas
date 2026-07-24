import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { AuditLog } from '../../domain/entities/AuditLog';
import type { AuditLogFilters, AuditLogRepository, CreateAuditLogInput } from '../../domain/repositories/AuditLogRepository';

const include = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogInclude;

export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: AuditLogFilters = {}): Promise<{ data: AuditLog[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.modulo) where.modulo = filters.modulo;
    if (filters.accion) where.accion = filters.accion;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.AuditLogOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.AuditLogWhereInput = {
        ...where,
        OR: [{ id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } }],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.auditLog.findMany({
          where: cursorWhere,
          include,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new AuditLog(r)),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include,
        orderBy: orderBy as Prisma.AuditLogOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: rows.map((r) => new AuditLog(r)),
      meta: { total, page, limit },
    };
  }

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const row = await this.prisma.auditLog.create({
      data: {
        accion: data.accion,
        modulo: data.modulo,
        usuarioId: data.usuarioId,
        referenciaId: data.referenciaId,
        ip: data.ip,
        userAgent: data.userAgent,
        metadata: data.metadata as Parameters<typeof this.prisma.auditLog.create>[0]['data']['metadata'],
      },
      include,
    });
    return new AuditLog(row);
  }

  async getById(id: string): Promise<AuditLog | null> {
    const row = await this.prisma.auditLog.findFirst({ where: { id } });
    return row ? new AuditLog(row) : null;
  }

  async update(id: string, data: { accion?: string; modulo?: string; referenciaId?: string | null; ip?: string | null; userAgent?: string | null; metadata?: unknown }): Promise<AuditLog> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Registro de auditoría no encontrado');

    const row = await this.prisma.auditLog.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata as Parameters<typeof this.prisma.auditLog.update>[0]['data']['metadata'],
      },
      include,
    });
    return new AuditLog(row);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Registro de auditoría no encontrado');
    await this.prisma.auditLog.delete({ where: { id } });
  }
}
