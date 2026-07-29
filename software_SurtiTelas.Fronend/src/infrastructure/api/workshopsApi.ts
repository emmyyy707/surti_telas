import { api } from './httpClient';

export interface WorkshopDTO {
  id: string;
  nombre: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  capacidad?: number;
  ocupacion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workshop {
  id: string;
  nombre: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado: 'Activo' | 'Inactivo';
  capacidad?: number;
  ocupacion?: number;
}

export function toWorkshop(dto: WorkshopDTO): Workshop {
  return {
    id: dto.id,
    nombre: dto.nombre,
    encargadoId: dto.encargadoId,
    direccion: dto.direccion ?? '',
    ciudad: dto.ciudad ?? '',
    telefono: dto.telefono ?? '',
    email: dto.email ?? '',
    estado: dto.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    capacidad: dto.capacidad,
    ocupacion: dto.ocupacion,
  };
}

function toWorkshopBody(w: Partial<Workshop>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (w.nombre !== undefined) body.nombre = w.nombre;
  if (w.encargadoId !== undefined) body.encargadoId = w.encargadoId;
  if (w.direccion !== undefined) body.direccion = w.direccion;
  if (w.ciudad !== undefined) body.ciudad = w.ciudad;
  if (w.telefono !== undefined) body.telefono = w.telefono;
  if (w.email !== undefined) body.email = w.email;
  if (w.capacidad !== undefined) body.capacidad = w.capacidad;
  if (w.estado !== undefined) body.estado = w.estado === 'Activo' ? 'ACTIVO' : 'INACTIVO';
  return body;
}

export const workshopsApi = {
  async list(): Promise<Workshop[]> {
    const response = await api.get<{ items: WorkshopDTO[]; meta: Record<string, unknown> }>('/production/workshops');
    const data = response?.items ?? [];
    return data.map(toWorkshop);
  },

  async create(w: Partial<Workshop>): Promise<Workshop> {
    const dto = await api.post<WorkshopDTO>('/production/workshops', toWorkshopBody(w));
    return toWorkshop(dto);
  },

  async update(id: string, changes: Partial<Workshop>): Promise<Workshop> {
    const dto = await api.patch<WorkshopDTO>(
      `/production/workshops/${encodeURIComponent(id)}`,
      toWorkshopBody(changes),
    );
    return toWorkshop(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/production/workshops/${encodeURIComponent(id)}`);
  },
};
