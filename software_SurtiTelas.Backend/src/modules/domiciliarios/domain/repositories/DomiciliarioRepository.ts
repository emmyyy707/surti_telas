import type { Domiciliario } from '../entities/Domiciliario';

export interface DomiciliarioFilters {
  zona?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'createdAt' | 'zona' | 'capacidad';
  order?: 'asc' | 'desc';
}

export interface CreateDomiciliarioInput {
  userId: string;
  zona?: string;
  vehiculo?: string;
  capacidad?: number;
}

export interface UpdateDomiciliarioInput {
  zona?: string;
  vehiculo?: string;
  capacidad?: number;
  activo?: boolean;
}

export interface DomiciliarioRepository {
  list(filters?: DomiciliarioFilters): Promise<{ data: Domiciliario[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Domiciliario | null>;
  getByUserId(userId: string): Promise<Domiciliario | null>;
  create(data: CreateDomiciliarioInput): Promise<Domiciliario>;
  update(id: string, changes: UpdateDomiciliarioInput): Promise<Domiciliario>;
}
