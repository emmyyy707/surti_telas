/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { Return } from '../../domain/entities/Return';
import type { ReturnData, ReturnFilters, ReturnListResult, ReturnRepository } from '../../domain/repositories/ReturnRepository';
import { toCreateInput, toReturn, toReturnData, toUpdateInput } from '../mappers/ReturnMapper';

export class PrismaReturnRepository implements ReturnRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ReturnFilters = {}): Promise<ReturnListResult> {
    const where: Prisma.ReturnWhereInput = { deletedAt: null };
    if (filters.estado) where.estado = filters.estado;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.return.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.return.count({ where }),
    ]);

    return {
      data: rows.map((r: any) => toReturnData(r)),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Return | null> {
    const row = await this.prisma.return.findFirst({ where: { id, deletedAt: null } });
    return row ? toReturn(row) : null;
  }

  async create(data: ReturnData): Promise<Return> {
    const ret = new Return(data);
    const row = await this.prisma.return.create({
      data: toCreateInput(ret) as unknown as Prisma.ReturnCreateInput,
    });
    return toReturn(row);
  }

  async update(id: string, changes: Partial<ReturnData>): Promise<Return> {
    const row = await this.prisma.return.update({
      where: { id },
      data: toUpdateInput(changes) as Prisma.ReturnUpdateInput,
    });
    return toReturn(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.return.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async nextNumero(): Promise<string> {
    const last = await this.prisma.return.findFirst({
      where: { numeroDevolucion: { startsWith: 'DEV-' } },
      orderBy: { createdAt: 'desc' },
    });
    let seq = 1;
    if (last?.numeroDevolucion) {
      const match = /DEV-(\d+)/.exec(last.numeroDevolucion);
      if (match) seq = parseInt(match[1], 10) + 1;
    }
    return `DEV-${String(seq).padStart(4, '0')}`;
  }
}

