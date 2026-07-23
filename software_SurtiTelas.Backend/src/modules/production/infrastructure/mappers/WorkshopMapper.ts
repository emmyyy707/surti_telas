import type { WorkshopData, WorkshopStatus } from '../../domain/entities/Workshop';

type WorkshopRow = {
  id: string;
  nombre: string;
  encargadoId: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string;
  capacidad: number | null;
};

export function toWorkshopData(row: WorkshopRow): WorkshopData {
  return {
    id: row.id,
    nombre: row.nombre,
    encargadoId: row.encargadoId ?? undefined,
    direccion: row.direccion ?? undefined,
    ciudad: row.ciudad ?? undefined,
    estado: row.estado as WorkshopStatus,
    capacidad: row.capacidad ?? undefined,
  };
}

export const WORKSHOP_STATUS_TO_DB: Record<WorkshopStatus, 'ACTIVO' | 'INACTIVO'> = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
};
