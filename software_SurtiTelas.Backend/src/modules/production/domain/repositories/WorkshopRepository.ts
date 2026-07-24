import type { Workshop, WorkshopStatus } from '../entities/Workshop';

export interface CreateWorkshopInput {
  nombre: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  estado?: WorkshopStatus;
  capacidad?: number;
}

export interface UpdateWorkshopInput {
  nombre?: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  estado?: WorkshopStatus;
  capacidad?: number;
}

export interface WorkshopFilters {
  search?: string;
  estado?: WorkshopStatus;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'nombre' | 'ciudad' | 'capacidad';
  order?: 'asc' | 'desc';
}

export interface WorkshopRepository {
  list(filters?: WorkshopFilters): Promise<{ data: Workshop[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Workshop | null>;
  create(input: CreateWorkshopInput): Promise<Workshop>;
  update(id: string, changes: UpdateWorkshopInput): Promise<Workshop>;
  delete(id: string): Promise<void>;
}
