import { Prisma, PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { ControlPrenda, type ControlPrendaEstado } from '../../domain/entities/ControlPrenda';
import type {
  ControlPrendaFilters,
  ControlPrendaRepository,
  CreateControlPrendaInput,
  UpdateControlPrendaInput,
} from '../../domain/repositories/ControlPrendaRepository';
import { estadoToDb, etapaToDb, toControlPrendaData } from '../mappers/ControlPrendaMapper';

const include = {
  produccion: {
    select: {
      id: true,
      referencia: true,
      cantidad: true,
      estado: true,
    },
  },
  revisadoPor: {
    select: {
      id: true,
      nombre: true,
    },
  },
  creadoPor: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.ControlPrendaInclude;

export class PrismaControlPrendaRepository implements ControlPrendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ControlPrendaFilters = {}): Promise<{ data: ControlPrenda[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.ControlPrendaWhereInput = { deletedAt: null };
    if (filters.produccionId) where.produccionId = filters.produccionId;
    if (filters.etapa) where.etapa = etapaToDb(filters.etapa);
    if (filters.estado) where.estado = estadoToDb(filters.estado);

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.ControlPrendaOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.ControlPrendaWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.controlPrenda.findMany({
          where: cursorWhere,
          include,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.controlPrenda.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new ControlPrenda(toControlPrendaData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.controlPrenda.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.controlPrenda.count({ where }),
    ]);

    return {
      data: rows.map((r) => new ControlPrenda(toControlPrendaData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<ControlPrenda | null> {
    const row = await this.prisma.controlPrenda.findFirst({ where: { id, deletedAt: null }, include });
    return row ? new ControlPrenda(toControlPrendaData(row)) : null;
  }

  async create(input: CreateControlPrendaInput): Promise<ControlPrenda> {
    const row = await this.prisma.controlPrenda.create({
      data: {
        produccionId: input.produccionId,
        etapa: etapaToDb(input.etapa),
        cantidadTotal: input.cantidadTotal,
        cantidadRevisada: input.cantidadRevisada ?? 0,
        cantidadAprobada: input.cantidadAprobada ?? 0,
        cantidadRechazada: input.cantidadRechazada ?? 0,
        observaciones: input.observaciones,
        revisadoPorId: input.revisadoPorId,
        creadoPorId: input.creadoPorId,
      },
      include,
    });
    return new ControlPrenda(toControlPrendaData(row));
  }

  async update(id: string, changes: UpdateControlPrendaInput): Promise<ControlPrenda> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');

    const row = await this.prisma.controlPrenda.update({
      where: { id },
      data: {
        etapa: changes.etapa ? etapaToDb(changes.etapa) : undefined,
        estado: changes.estado ? estadoToDb(changes.estado) : undefined,
        cantidadTotal: changes.cantidadTotal,
        cantidadRevisada: changes.cantidadRevisada,
        cantidadAprobada: changes.cantidadAprobada,
        cantidadRechazada: changes.cantidadRechazada,
        observaciones: changes.observaciones,
        revisadoPorId: changes.revisadoPorId,
      },
      include,
    });
    return new ControlPrenda(toControlPrendaData(row));
  }

  async review(id: string, estado: ControlPrendaEstado, revisadoPorId: string, observaciones?: string): Promise<ControlPrenda> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    if (estado === 'APROBADO' && !existing.puedeAprobar()) throw new BadRequestError('Este control ya fue aprobado');
    if (estado === 'RECHAZADO' && !existing.puedeRechazar()) throw new BadRequestError('Este control ya fue rechazado');

    const row = await this.prisma.controlPrenda.update({
      where: { id },
      data: {
        estado: estadoToDb(estado),
        revisadoPorId,
        observaciones: observaciones ?? existing.observaciones,
      },
      include,
    });
    return new ControlPrenda(toControlPrendaData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    await this.prisma.controlPrenda.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
