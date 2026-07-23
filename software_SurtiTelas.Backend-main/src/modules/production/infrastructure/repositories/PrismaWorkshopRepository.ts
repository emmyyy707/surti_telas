import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Workshop } from '../../domain/entities/Workshop';
import type {
  CreateWorkshopInput,
  WorkshopFilters,
  WorkshopRepository,
  UpdateWorkshopInput,
} from '../../domain/repositories/WorkshopRepository';
import { toWorkshopData, WORKSHOP_STATUS_TO_DB } from '../mappers/WorkshopMapper';

export class PrismaWorkshopRepository implements WorkshopRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: WorkshopFilters = {}): Promise<{ data: Workshop[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.WorkshopWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { ciudad: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.estado) where.estado = WORKSHOP_STATUS_TO_DB[filters.estado];

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'nombre';
    const order = filters.order ?? 'asc';
    const orderBy: Prisma.WorkshopOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.WorkshopWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.workshop.findMany({
          where: cursorWhere,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.workshop.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Workshop(toWorkshopData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.workshop.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workshop.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Workshop(toWorkshopData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Workshop | null> {
    const row = await this.prisma.workshop.findFirst({ where: { id, deletedAt: null } });
    return row ? new Workshop(toWorkshopData(row)) : null;
  }

  async create(input: CreateWorkshopInput): Promise<Workshop> {
    const row = await this.prisma.workshop.create({
      data: {
        nombre: input.nombre,
        encargadoId: input.encargadoId,
        direccion: input.direccion,
        ciudad: input.ciudad,
        estado: input.estado ? WORKSHOP_STATUS_TO_DB[input.estado] : 'ACTIVO',
        capacidad: input.capacidad,
      },
    });
    return new Workshop(toWorkshopData(row));
  }

  async update(id: string, changes: UpdateWorkshopInput): Promise<Workshop> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Taller no encontrado');

    const row = await this.prisma.workshop.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        encargadoId: changes.encargadoId,
        direccion: changes.direccion,
        ciudad: changes.ciudad,
        estado: changes.estado ? WORKSHOP_STATUS_TO_DB[changes.estado] : undefined,
        capacidad: changes.capacidad,
      },
    });
    return new Workshop(toWorkshopData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Taller no encontrado');
    await this.prisma.workshop.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
