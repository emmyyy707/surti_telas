import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { InventoryMovement } from '../../domain/entities/InventoryMovement';
import type {
  CreateMovementInput,
  InventoryMovementRepository,
  MovementFilters,
} from '../../domain/repositories/InventoryMovementRepository';
import { toInventoryMovementData } from '../mappers/MovementMapper';

export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: MovementFilters = {}): Promise<{ data: InventoryMovement[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.InventoryMovementWhereInput = { deletedAt: null };
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.productId) where.productId = filters.productId;
    if (filters.rawMaterialId) where.rawMaterialId = filters.rawMaterialId;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.desde || filters.hasta) {
      where.fecha = {};
      if (filters.desde) where.fecha.gte = new Date(filters.desde);
      if (filters.hasta) where.fecha.lte = new Date(filters.hasta);
    }

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'fecha';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.InventoryMovementOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.InventoryMovementWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.inventoryMovement.findMany({
          where: cursorWhere,
          orderBy: orderBy as Prisma.InventoryMovementOrderByWithRelationInput,
          take: limit + 1,
        }),
        this.prisma.inventoryMovement.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new InventoryMovement(toInventoryMovementData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.findMany({
        where,
        orderBy: orderBy as Prisma.InventoryMovementOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      data: rows.map((r) => new InventoryMovement(toInventoryMovementData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<InventoryMovement | null> {
    const row = await this.prisma.inventoryMovement.findFirst({ where: { id, deletedAt: null } });
    return row ? new InventoryMovement(toInventoryMovementData(row)) : null;
  }

  async create(input: CreateMovementInput): Promise<InventoryMovement> {
    const row = await this.prisma.inventoryMovement.create({
      data: {
        tipo: input.tipo,
        productId: input.productId,
        rawMaterialId: input.rawMaterialId,
        cantidad: input.cantidad,
        ajuste: input.ajuste,
        motivo: input.motivo,
        usuarioId: input.usuarioId,
      },
    });
    return new InventoryMovement(toInventoryMovementData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Movimiento no encontrado');
    await this.prisma.inventoryMovement.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
