import { PrismaClient } from '@prisma/client';
import type { CategoryRepository } from '../../domain/repositories/ProductRepository';
import type { CategoryData } from '../../domain/entities/Category';

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<CategoryData[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { nombre: 'asc' } });
    return rows.map((r) => ({ id: r.id, nombre: r.nombre, slug: r.slug, parentId: r.parentId }));
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
