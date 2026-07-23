import { Prisma, PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { Product } from '../../domain/entities/Product';
import type {
  CreateProductInput,
  ProductFilters,
  ProductRepository,
  UpdateProductInput,
} from '../../domain/repositories/ProductRepository';
import { toCreateInput, toProductData, toUpdateInput } from '../mappers/ProductMapper';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ProductFilters = {}): Promise<{ data: Product[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { ref: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.categoriaId) where.categoriaId = filters.categoriaId;
    else if (filters.categoria) {
      const categoria = await this.prisma.category.findFirst({
        where: {
          OR: [
            { nombre: { contains: filters.categoria, mode: 'insensitive' } },
            { slug: { contains: filters.categoria, mode: 'insensitive' } },
          ],
        },
      });
      if (categoria) where.categoriaId = categoria.id;
    }
    if (filters.publicado !== undefined) where.publicado = filters.publicado;
    if (filters.destacado !== undefined) where.destacado = filters.destacado;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.ProductWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where: cursorWhere,
          include: { categoria: true },
          orderBy,
          take: limit + 1,
        }),
        this.prisma.product.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Product(toProductData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { categoria: true },
        orderBy: orderBy as Prisma.ProductOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Product(toProductData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { id, deletedAt: null }, include: { categoria: true } });
    return row ? new Product(toProductData(row)) : null;
  }

  async getByRef(ref: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { ref, deletedAt: null }, include: { categoria: true } });
    return row ? new Product(toProductData(row)) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const categoriaId = await this.resolveCategoriaId(input);
    const ref = input.ref?.trim() || `REF-${Date.now()}`;
    const product = new Product({ ...input, ref });
    const row = await this.prisma.product.create({
      data: toCreateInput(product, categoriaId, ref) as Prisma.ProductCreateInput,
      include: { categoria: true },
    });
    return new Product(toProductData(row));
  }

  async update(ref: string, changes: UpdateProductInput): Promise<Product> {
    const existing = await this.getByRef(ref);
    if (!existing) throw new NotFoundError('Producto no encontrado');

    const categoriaId =
      changes.categoriaId !== undefined
        ? changes.categoriaId
        : changes.categoria !== undefined
          ? await this.resolveCategoriaId({ ...changes, categoria: changes.categoria })
          : undefined;

    const data = toUpdateInput({ ...changes, categoriaId: categoriaId ?? undefined });
    const row = await this.prisma.product.update({
      where: { ref },
      data: data as Prisma.ProductUpdateInput,
      include: { categoria: true },
    });
    return new Product(toProductData(row));
  }

  async delete(ref: string): Promise<void> {
    const existing = await this.getByRef(ref);
    if (!existing) throw new NotFoundError('Producto no encontrado');
    await this.prisma.product.update({ where: { ref }, data: { deletedAt: new Date() } });
  }

  private async resolveCategoriaId(input: { categoria?: string; categoriaId?: string }): Promise<string | null> {
    if (input.categoriaId) return input.categoriaId;
    if (!input.categoria) return null;
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ slug: input.categoria }, { nombre: input.categoria }] },
    });
    if (!category) {
      throw new BadRequestError(`Categoría "${input.categoria}" no existe`);
    }
    return category.id;
  }
}
