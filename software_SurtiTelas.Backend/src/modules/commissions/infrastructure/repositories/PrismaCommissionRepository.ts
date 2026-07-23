import { Prisma, PrismaClient } from '@prisma/client';
import { Commission } from '../../domain/entities/Commission';
import { CommissionRepository } from '../../domain/repositories/CommissionRepository';

export class PrismaCommissionRepository implements CommissionRepository {
  constructor(private prisma: PrismaClient) {}

  async list(filters: { asesorId?: string; orderId?: string }): Promise<Commission[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.orderId) where.orderId = filters.orderId;

    const rows = await this.prisma.commission.findMany({ where, orderBy: { createdAt: 'desc' } });
    return rows.map(CommissionMapper.toDomain);
  }

  async getById(id: string): Promise<Commission | null> {
    const row = await this.prisma.commission.findFirst({ where: { id, deletedAt: null } });
    return row ? CommissionMapper.toDomain(row) : null;
  }

  async create(input: { asesorId: string; orderId?: string; monto: number; porcentaje: number; notas?: string }): Promise<Commission> {
    const row = await this.prisma.commission.create({
      data: {
        asesorId: input.asesorId,
        orderId: input.orderId,
        monto: input.monto,
        porcentaje: input.porcentaje,
        notas: input.notas,
      },
    });
    return CommissionMapper.toDomain(row);
  }
}

export const CommissionMapper = {
  toDomain(row: Prisma.CommissionGetPayload<object>): Commission {
    return new Commission({
      id: row.id,
      asesorId: row.asesorId,
      orderId: row.orderId ?? undefined,
      monto: Number(row.monto.toNumber()),
      porcentaje: Number(row.porcentaje.toNumber()),
      estado: row.estado,
      notas: row.notas ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  },
};
