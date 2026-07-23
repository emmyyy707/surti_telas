import { api } from './httpClient';
import type { BackendAuthUser } from './authApi';

export type UserRole = 'admin' | 'asesor' | 'domiciliario' | 'cliente' | 'almacen' | 'produccion' | 'reportes';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
  fechaRegistro: string;
  pedidosRealizados: number;
}

function mapBackendRole(role: string | undefined): UserRole {
  switch (role) {
    case 'ADMIN': return 'admin';
    case 'ASESOR': return 'asesor';
    case 'DOMICILIARIO': return 'domiciliario';
    case 'CLIENTE': return 'cliente';
    case 'ALMACEN': return 'almacen';
    case 'PRODUCCION': return 'produccion';
    case 'REPORTES': return 'reportes';
    default: return 'cliente';
  }
}

function toUser(dto: BackendAuthUser & { estado?: string; createdAt?: string; pedidosRealizados?: number }): Usuario {
  const estado = dto.estado === 'INACTIVO' ? 'Inactivo' : dto.estado === 'PENDIENTE' ? 'Pendiente' : 'Activo';
  return {
    id: dto.id,
    nombre: dto.nombre,
    email: dto.email,
    rol: mapBackendRole(dto.role),
    estado,
    fechaRegistro: (dto.createdAt ?? '').slice(0, 10),
    pedidosRealizados: dto.pedidosRealizados ?? 0,
  };
}

export interface CreateUserInput {
  nombre: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE';
  telefono?: string;
}

export interface UpdateUserInput {
  nombre?: string;
  telefono?: string;
}

export const usersApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Usuario[]> {
    const response = await api.get<{ items: (BackendAuthUser & { estado?: string; createdAt?: string; pedidosRealizados?: number })[]; meta: Record<string, unknown> }>('/auth/users', { query });
    const data = response?.items ?? [];
    return data.map(toUser);
  },

  async create(input: CreateUserInput): Promise<Usuario> {
    const dto = await api.post<BackendAuthUser & { estado?: string; createdAt?: string }>('/auth/users', input);
    return toUser(dto);
  },

  async update(id: string, changes: UpdateUserInput): Promise<Usuario> {
    const dto = await api.patch<BackendAuthUser & { estado?: string; createdAt?: string }>(`/auth/users/${encodeURIComponent(id)}`, changes);
    return toUser(dto);
  },

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<Usuario> {
    const dto = await api.patch<BackendAuthUser & { estado?: string; createdAt?: string }>(`/auth/users/${encodeURIComponent(id)}/status`, { estado });
    return toUser(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/auth/users/${encodeURIComponent(id)}`);
  },
};

export default usersApi;
