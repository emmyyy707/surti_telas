import { api } from './httpClient';

export interface Domiciliario {
  id: string;
  userId: string;
  zona?: string;
  vehiculo?: string;
  capacidad?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DomiciliarioFilters {
  zona?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
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

export const domiciliariosApi = {
  list: (filters?: DomiciliarioFilters) =>
    api.get<{ items: Domiciliario[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor: string | null }>('/domiciliarios', { query: filters as Record<string, string | number | boolean | undefined | null> }),

  get: (id: string) =>
    api.get<Domiciliario>(`/domiciliarios/${id}`),

  getByUserId: (userId: string) =>
    api.get<Domiciliario>(`/domiciliarios/user/${userId}`),

  create: (data: CreateDomiciliarioInput) =>
    api.post<Domiciliario>('/domiciliarios', data),

  update: (id: string, data: UpdateDomiciliarioInput) =>
    api.patch<Domiciliario>(`/domiciliarios/${id}`, data),
};
