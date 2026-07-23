import { Prisma, PrismaClient, ControlPrendaEtapa, ControlPrendaEstado } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import type { ControlPrendaRepository, ControlPrendaListItem, CreateControlPrendaInput, ReviewControlPrendaInput } from '../../domain/repositories/ControlPrendaRepository';

const ETAPA_DB_MAP: Record<string, ControlPrendaEtapa> = {
  CORTE: 'CORTE',
  CONFECCION: 'CONFECCION',
  ACABADO: 'ACABADO',
  CONTROL_CALIDAD: 'CONTROL_CALIDAD',
  EMPAQUE: 'EMPAQUE',
};

const ESTADO_DB_MAP: Record<string, ControlPrendaEstado> = {
  PROCESO: 'PROCESO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
};

export class PrismaControlPrendaRepository implements ControlPrendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateControlPrendaInput) {
    const row = await this.prisma.controlPrenda.create({
      data: {
        produccionId: input.produccionId,
        etapa: ETAPA_DB_MAP[input.etapa.toUpperCase()] ?? input.etapa.toUpperCase() as ControlPrendaEtapa,
        cantidadTotal: input.cantidadTotal,
        cantidadRevisada: 0,
        cantidadAprobada: 0,
        cantidadRechazada: 0,
        observaciones: input.observaciones ?? null,
        creadoPorId: input.creadoPorId,
      },
      include: {
        creadoPor: { select: { id: true, nombre: true } },
        revisadoPor: { select: { id: true, nombre: true } },
      },
    });
    return this.toItem(row);
  }

  async list(filters: { produccionId?: string; etapa?: string; estado?: string } = {}) {
    const where: Prisma.ControlPrendaWhereInput = { deletedAt: null };
    if (filters.produccionId) where.produccionId = filters.produccionId;
    if (filters.etapa) {
      const etapaUpper = filters.etapa.toUpperCase();
      where.etapa = ETAPA_DB_MAP[etapaUpper] ?? (etapaUpper as ControlPrendaEtapa);
    }
    if (filters.estado) {
      const estadoUpper = filters.estado.toUpperCase();
      where.estado = ESTADO_DB_MAP[estadoUpper] ?? (estadoUpper as ControlPrendaEstado);
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.controlPrenda.findMany({
        where,
        include: {
          creadoPor: { select: { id: true, nombre: true } },
          revisadoPor: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.controlPrenda.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toItem(r)),
      meta: { total },
    };
  }

  async getById(id: string) {
    const row = await this.prisma.controlPrenda.findFirst({
      where: { id, deletedAt: null },
      include: {
        creadoPor: { select: { id: true, nombre: true } },
        revisadoPor: { select: { id: true, nombre: true } },
      },
    });
    return row ? this.toItem(row) : null;
  }

  async review(id: string, changes: ReviewControlPrendaInput) {
    const existing = await this.prisma.controlPrenda.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');

    const data: Prisma.ControlPrendaUpdateInput = {
      estado: ESTADO_DB_MAP[changes.estado] ?? changes.estado as ControlPrendaEstado,
      revisadoPor: { connect: { id: changes.revisadoPorId } },
    };
    if (changes.cantidadAprobada !== undefined) data.cantidadAprobada = changes.cantidadAprobada;
    if (changes.cantidadRechazada !== undefined) data.cantidadRechazada = changes.cantidadRechazada;

    const row = await this.prisma.controlPrenda.update({
      where: { id },
      data,
      include: {
        creadoPor: { select: { id: true, nombre: true } },
        revisadoPor: { select: { id: true, nombre: true } },
      },
    });
    return this.toItem(row);
  }

  async update(id: string, changes: Partial<ControlPrendaListItem>) {
    const existing = await this.prisma.controlPrenda.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');

    const data: Prisma.ControlPrendaUpdateInput = {};
    if (changes.etapa !== undefined) data.etapa = ETAPA_DB_MAP[changes.etapa.toUpperCase()] ?? (changes.etapa.toUpperCase() as ControlPrendaEtapa);
    if (changes.cantidadTotal !== undefined) data.cantidadTotal = changes.cantidadTotal;
    if (changes.cantidadRevisada !== undefined) data.cantidadRevisada = changes.cantidadRevisada;
    if (changes.cantidadAprobada !== undefined) data.cantidadAprobada = changes.cantidadAprobada;
    if (changes.cantidadRechazada !== undefined) data.cantidadRechazada = changes.cantidadRechazada;
    if (changes.observaciones !== undefined) data.observaciones = changes.observaciones;

    const row = await this.prisma.controlPrenda.update({
      where: { id },
      data,
      include: {
        creadoPor: { select: { id: true, nombre: true } },
        revisadoPor: { select: { id: true, nombre: true } },
      },
    });
    return this.toItem(row);
  }

  async delete(id: string) {
    const existing = await this.prisma.controlPrenda.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    await this.prisma.controlPrenda.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private toItem(row: {
    id: string;
    produccionId: string;
    etapa: ControlPrendaEtapa;
    estado: ControlPrendaEstado;
    cantidadTotal: number;
    cantidadRevisada: number;
    cantidadAprobada: number;
    cantidadRechazada: number;
    observaciones?: string | null;
    revisadoPor?: { id: string; nombre: string } | null;
    creadoPor: { id: string; nombre: string };
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      produccionId: row.produccionId,
      etapa: row.etapa,
      estado: row.estado,
      cantidadTotal: row.cantidadTotal,
      cantidadRevisada: row.cantidadRevisada,
      cantidadAprobada: row.cantidadAprobada,
      cantidadRechazada: row.cantidadRechazada,
      observaciones: row.observaciones ?? undefined,
      revisadoPor: row.revisadoPor ?? null,
      creadoPor: row.creadoPor,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
