import type { ControlPrendaData, ControlPrendaEstado, ControlPrendaEtapa } from '../../domain/entities/ControlPrenda';
import { ControlPrendaEstado as DbEstado, ControlPrendaEtapa as DbEtapa } from '@prisma/client';

type ControlPrendaRow = {
  id: string;
  produccionId: string;
  etapa: DbEtapa;
  estado: DbEstado;
  cantidadTotal: number;
  cantidadRevisada: number;
  cantidadAprobada: number;
  cantidadRechazada: number;
  observaciones: string | null;
  revisadoPorId: string | null;
  creadoPorId: string;
  revisadoPor?: {
    id: string;
    nombre: string;
  } | null;
  creadoPor?: {
    id: string;
    nombre: string;
  };
  produccion?: {
    id: string;
    referencia: string;
    cantidad: number;
    estado: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

const DB_TO_ETAPA: Record<DbEtapa, ControlPrendaEtapa> = {
  CORTE: 'CORTE',
  CONFECCION: 'CONFECCION',
  ACABADO: 'ACABADO',
  CONTROL_CALIDAD: 'CONTROL_CALIDAD',
  EMPAQUE: 'EMPAQUE',
};

const DB_TO_ESTADO: Record<DbEstado, ControlPrendaEstado> = {
  PROCESO: 'PROCESO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
};

export function toControlPrendaData(row: ControlPrendaRow): ControlPrendaData {
  return {
    id: row.id,
    produccionId: row.produccionId,
    etapa: DB_TO_ETAPA[row.etapa],
    estado: DB_TO_ESTADO[row.estado],
    cantidadTotal: row.cantidadTotal,
    cantidadRevisada: row.cantidadRevisada,
    cantidadAprobada: row.cantidadAprobada,
    cantidadRechazada: row.cantidadRechazada,
    observaciones: row.observaciones ?? undefined,
    revisadoPorId: row.revisadoPorId ?? undefined,
    creadoPorId: row.creadoPorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

export const etapaToDb = (etapa: ControlPrendaEtapa): DbEtapa => {
  const map: Record<ControlPrendaEtapa, DbEtapa> = {
    CORTE: 'CORTE',
    CONFECCION: 'CONFECCION',
    ACABADO: 'ACABADO',
    CONTROL_CALIDAD: 'CONTROL_CALIDAD',
    EMPAQUE: 'EMPAQUE',
  };
  return map[etapa];
};

export const estadoToDb = (estado: ControlPrendaEstado): DbEstado => {
  const map: Record<ControlPrendaEstado, DbEstado> = {
    PROCESO: 'PROCESO',
    APROBADO: 'APROBADO',
    RECHAZADO: 'RECHAZADO',
  };
  return map[estado];
};
