import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { RawMaterial } from '../../domain/entities/RawMaterial';
import type {
  CreateRawMaterialInput,
  RawMaterialFilters,
  RawMaterialRepository,
  UpdateRawMaterialInput,
} from '../../domain/repositories/RawMaterialRepository';
import { toRawMaterialData } from '../mappers/RawMaterialMapper';

export class PrismaRawMaterialRepository implements RawMaterialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: RawMaterialFilters = {}): Promise<{ data: RawMaterial[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.RawMaterialWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { categoria: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.proveedorId) where.proveedorId = filters.proveedorId;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'nombre';
    const order = filters.order ?? 'asc';
    const orderBy: Prisma.RawMaterialOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.RawMaterialWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.rawMaterial.findMany({
          where: cursorWhere,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.rawMaterial.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      let results = data.map((r) => new RawMaterial(toRawMaterialData(r)));
      if (filters.necesitaReposicion) {
        results = results.filter((r) => r.necesitaReposicion());
      }

      return {
        data: results,
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.rawMaterial.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.rawMaterial.count({ where }),
    ]);

    let results = rows.map((r) => new RawMaterial(toRawMaterialData(r)));
    if (filters.necesitaReposicion) {
      results = results.filter((r) => r.necesitaReposicion());
    }

    return {
      data: results,
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<RawMaterial | null> {
    const row = await this.prisma.rawMaterial.findFirst({ where: { id, deletedAt: null } });
    return row ? new RawMaterial(toRawMaterialData(row)) : null;
  }

  async create(input: CreateRawMaterialInput): Promise<RawMaterial> {
    const row = await this.prisma.rawMaterial.create({
      data: {
        nombre: input.nombre,
        categoria: input.categoria,
        unidadMedida: input.unidadMedida,
        stockActual: input.stockActual ?? 0,
        stockMinimo: input.stockMinimo ?? 0,
        proveedorId: input.proveedorId,
        precioUnitario: input.precioUnitario,
      },
    });
    return new RawMaterial(toRawMaterialData(row));
  }

  async update(id: string, changes: UpdateRawMaterialInput): Promise<RawMaterial> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Insumo no encontrado');

    const row = await this.prisma.rawMaterial.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        categoria: changes.categoria,
        unidadMedida: changes.unidadMedida,
        stockActual: changes.stockActual,
        stockMinimo: changes.stockMinimo,
        proveedorId: changes.proveedorId,
        precioUnitario: changes.precioUnitario,
      },
    });
    return new RawMaterial(toRawMaterialData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Insumo no encontrado');
    await this.prisma.rawMaterial.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
