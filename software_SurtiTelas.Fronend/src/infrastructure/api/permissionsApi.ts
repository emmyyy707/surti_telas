import { api } from './httpClient';

export interface PermissionDTO {
  id: string;
  name: string;
  module: string;
  description: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  estado: 'Activo' | 'Inactivo';
}

export function toPermission(dto: PermissionDTO): Permission {
  return {
    id: dto.id,
    name: dto.name,
    module: dto.module,
    description: dto.description,
    estado: dto.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
  };
}

export const permissionsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Permission[]> {
    const response = await api.get<{ items: PermissionDTO[]; meta: Record<string, unknown> }>('/auth/permissions', { query });
    const data = response?.items ?? [];
    return data.map(toPermission);
  },

  async getById(id: string): Promise<Permission | null> {
    try {
      const dto = await api.get<PermissionDTO>(`/auth/permissions/${encodeURIComponent(id)}`);
      return dto ? toPermission(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: { name: string; module: string; description?: string }): Promise<Permission> {
    const dto = await api.post<PermissionDTO>('/auth/permissions', data);
    return toPermission(dto);
  },

  async update(id: string, changes: { name?: string; module?: string; description?: string; estado?: string }): Promise<Permission> {
    const dto = await api.patch<PermissionDTO>(`/auth/permissions/${encodeURIComponent(id)}`, changes);
    return toPermission(dto);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/auth/permissions/${encodeURIComponent(id)}`);
  },
};