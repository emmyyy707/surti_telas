import { PrismaClient } from '@prisma/client';
import type { CategoryRepository } from '../../domain/repositories/ProductRepository';
import type { CategoryData } from '../../domain/entities/Category';
import { BadRequestError } from '../../../../shared/domain/errors';

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

  async findById(id: string): Promise<CategoryData | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? { id: row.id, nombre: row.nombre, slug: row.slug, parentId: row.parentId } : null;
  }

  async update(id: string, input: { nombre?: string; slug?: string; parentId?: string | null }): Promise<CategoryData> {
    const row = await this.prisma.category.update({
      where: { id },
      data: input,
    });
    return { id: row.id, nombre: row.nombre, slug: row.slug, parentId: row.parentId };
  }

  async delete(id: string): Promise<void> {
    const count = await this.prisma.product.count({ where: { categoriaId: id, deletedAt: null } });
    if (count > 0) {
      throw new BadRequestError(`No se puede eliminar la categoría porque tiene ${count} producto(s) asociados`);
    }
    await this.prisma.category.delete({ where: { id } });
  }

  async findAllWithLowStockCount(): Promise<
    Array<CategoryData & { totalProductos: number; productosBajoStock: number; productosAgotados: number }>
  > {
    const rows = await this.prisma.category.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        products: {
          where: { deletedAt: null },
          select: { id: true, stockStatus: true },
        },
      },
    });

    return rows.map((r) => {
      const productos = r.products;
      const totalProductos = productos.length;
      const productosBajoStock = productos.filter((p) => p.stockStatus === 'BAJO_STOCK').length;
      const productosAgotados = productos.filter((p) => p.stockStatus === 'AGOTADO').length;
      return {
        id: r.id,
        nombre: r.nombre,
        slug: r.slug,
        parentId: r.parentId,
        totalProductos,
        productosBajoStock,
        productosAgotados,
      };
    });
  }
}
