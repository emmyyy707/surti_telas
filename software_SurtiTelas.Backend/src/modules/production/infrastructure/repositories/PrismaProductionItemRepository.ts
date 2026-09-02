import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { ProductionItem } from '../../domain/entities/ProductionItem';
import type { CreateProductionItemInput, ProductionItemFilters, ProductionItemRepository, UpdateProductionItemInput } from '../../domain/repositories/ProductionItemRepository';

export class PrismaProductionItemRepository implements ProductionItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ProductionItemFilters = {}): Promise<{ data: ProductionItem[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.ProductionItemWhereInput = { deletedAt: null };
    if (filters.produccionId) where.produccionId = filters.produccionId;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.ProductionItemOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.ProductionItemWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.productionItem.findMany({
          where: cursorWhere,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.productionItem.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new ProductionItem({
          id: r.id,
          produccionId: r.produccionId,
          nombre: r.nombre,
          descripcion: r.descripcion ?? undefined,
          cantidad: r.cantidad,
          unidad: r.unidad ?? undefined,
          precioUnitario: r.precioUnitario ? Number(r.precioUnitario) : undefined,
        })),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.productionItem.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productionItem.count({ where }),
    ]);

    return {
      data: rows.map((r) => new ProductionItem({
        id: r.id,
        produccionId: r.produccionId,
        nombre: r.nombre,
        descripcion: r.descripcion ?? undefined,
        cantidad: r.cantidad,
        unidad: r.unidad ?? undefined,
        precioUnitario: r.precioUnitario ? Number(r.precioUnitario) : undefined,
      })),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<ProductionItem | null> {
    const row = await this.prisma.productionItem.findFirst({ where: { id, deletedAt: null } });
    if (!row) return null;
    return new ProductionItem({
      id: row.id,
      produccionId: row.produccionId,
      nombre: row.nombre,
      descripcion: row.descripcion ?? undefined,
      cantidad: row.cantidad,
      unidad: row.unidad ?? undefined,
      precioUnitario: row.precioUnitario ? Number(row.precioUnitario) : undefined,
    });
  }

  async create(input: CreateProductionItemInput): Promise<ProductionItem> {
    const row = await this.prisma.productionItem.create({
      data: {
        produccionId: input.produccionId,
        nombre: input.nombre,
        descripcion: input.descripcion,
        cantidad: input.cantidad,
        unidad: input.unidad,
        precioUnitario: input.precioUnitario,
      },
    });
    return new ProductionItem({
      id: row.id,
      produccionId: row.produccionId,
      nombre: row.nombre,
      descripcion: row.descripcion ?? undefined,
      cantidad: row.cantidad,
      unidad: row.unidad ?? undefined,
      precioUnitario: row.precioUnitario ? Number(row.precioUnitario) : undefined,
    });
  }

  async update(id: string, changes: UpdateProductionItemInput): Promise<ProductionItem> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Item de producción no encontrado');

    const data: Record<string, unknown> = {};
    if (changes.nombre !== undefined) data.nombre = changes.nombre;
    if (changes.descripcion !== undefined) data.descripcion = changes.descripcion;
    if (changes.cantidad !== undefined) data.cantidad = changes.cantidad;
    if (changes.unidad !== undefined) data.unidad = changes.unidad;
    if (changes.precioUnitario !== undefined) data.precioUnitario = changes.precioUnitario;

    const row = await this.prisma.productionItem.update({
      where: { id },
      data,
    });

    return new ProductionItem({
      id: row.id,
      produccionId: row.produccionId,
      nombre: row.nombre,
      descripcion: row.descripcion ?? undefined,
      cantidad: row.cantidad,
      unidad: row.unidad ?? undefined,
      precioUnitario: row.precioUnitario ? Number(row.precioUnitario) : undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Item de producción no encontrado');
    await this.prisma.productionItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
