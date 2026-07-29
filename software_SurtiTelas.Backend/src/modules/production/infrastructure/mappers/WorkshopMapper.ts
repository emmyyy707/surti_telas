import type { WorkshopData, WorkshopStatus } from '../../domain/entities/Workshop';

type WorkshopRow = {
  id: string;
  nombre: string;
  encargadoId: string | null;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  estado: string;
  capacidad: number | null;
  ocupacion: number | null;
};

export function toWorkshopData(row: WorkshopRow): WorkshopData {
  return {
    id: row.id,
    nombre: row.nombre,
    encargadoId: row.encargadoId ?? undefined,
    direccion: row.direccion ?? undefined,
    ciudad: row.ciudad ?? undefined,
    telefono: row.telefono ?? null,
    email: row.email ?? null,
    estado: row.estado as WorkshopStatus,
    capacidad: row.capacidad ?? undefined,
    ocupacion: row.ocupacion ?? undefined,
  };
}

export const WORKSHOP_STATUS_TO_DB: Record<WorkshopStatus, 'ACTIVO' | 'INACTIVO'> = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
};
