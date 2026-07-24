import { PrismaClient } from '@prisma/client';
import type { CategoryRepository } from '../../domain/repositories/ProductRepository';
import type { CategoryData } from '../../domain/entities/Category';

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters?: { page?: number; limit?: number }): Promise<{ data: CategoryData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({ orderBy: { nombre: 'asc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.category.count(),
    ]);
    return {
      data: rows.map((r) => ({ id: r.id, nombre: r.nombre, slug: r.slug, parentId: r.parentId })),
      meta: { total, page, limit },
    };
  }

  async create(input: { nombre: string; slug: string; parentId?: string | null }): Promise<CategoryData> {
    const row = await this.prisma.category.create({ data: input });
    return { id: row.id, nombre: row.nombre, slug: row.slug, parentId: row.parentId };
  }

  async findBySlug(slug: string): Promise<CategoryData | null> {
    const row = await this.prisma.category.findUnique({ where: { slug } });
    return row ? { id: row.id, nombre: row.nombre, slug: row.slug, parentId: row.parentId } : null;
  }
}
