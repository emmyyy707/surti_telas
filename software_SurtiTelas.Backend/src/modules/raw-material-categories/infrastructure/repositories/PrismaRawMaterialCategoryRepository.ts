import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { RawMaterialCategory } from '../../domain/entities/RawMaterialCategory';
import type { RawMaterialCategoryRepository } from '../../domain/repositories/RawMaterialCategoryRepository';
import { toRawMaterialCategoryData } from '../mappers/RawMaterialCategoryMapper';

export class PrismaRawMaterialCategoryRepository implements RawMaterialCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: { search?: string; estado?: string; page?: number; limit?: number; cursor?: string; sort?: string; order?: string } = {}): Promise<{ data: RawMaterialCategory[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.RawMaterialCategoryWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.estado) where.estado = filters.estado;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'nombre';
    const order = filters.order ?? 'asc';
    const orderBy: Prisma.RawMaterialCategoryOrderByWithRelationInput[] = [{ [sort]: order as Prisma.SortOrder }, { id: order as Prisma.SortOrder }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.RawMaterialCategoryWhereInput = { ...where, OR: [{ id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } }] };
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.rawMaterialCategory.findMany({ where: cursorWhere, orderBy, take: limit + 1 }),
        this.prisma.rawMaterialCategory.count({ where }),
      ]);
      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;
      return { data: data.map((r) => new RawMaterialCategory(toRawMaterialCategoryData(r))), meta: { total, page: 1, limit, nextCursor } };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.rawMaterialCategory.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.rawMaterialCategory.count({ where }),
    ]);
    return { data: rows.map((r) => new RawMaterialCategory(toRawMaterialCategoryData(r))), meta: { total, page, limit } };
  }

  async getById(id: string): Promise<RawMaterialCategory | null> {
    const row = await this.prisma.rawMaterialCategory.findFirst({ where: { id, deletedAt: null } });
    return row ? new RawMaterialCategory(toRawMaterialCategoryData(row)) : null;
  }

  async create(input: { nombre: string; slug: string; descripcion?: string; estado?: string }): Promise<RawMaterialCategory> {
    const row = await this.prisma.rawMaterialCategory.create({
      data: {
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion,
        estado: input.estado ?? 'ACTIVO',
      },
    });
    return new RawMaterialCategory(toRawMaterialCategoryData(row));
  }

  async update(id: string, changes: { nombre?: string; slug?: string; descripcion?: string; estado?: string }): Promise<RawMaterialCategory> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Categoría de insumo no encontrada');

    const row = await this.prisma.rawMaterialCategory.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        slug: changes.slug,
        descripcion: changes.descripcion,
        estado: changes.estado,
      },
    });
    return new RawMaterialCategory(toRawMaterialCategoryData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Categoría de insumo no encontrada');
    await this.prisma.rawMaterialCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
