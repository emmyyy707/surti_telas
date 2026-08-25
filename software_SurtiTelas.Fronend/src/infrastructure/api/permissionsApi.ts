import { api } from './httpClient';

export interface PermissionDTO {
  id: string;
  code: string;
  description: string;
  module: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Permission {
  id: string;
  code: string;
  description: string;
  module: string;
  estado: 'Activo' | 'Inactivo';
}

export function toPermission(dto: PermissionDTO): Permission {
  return {
    id: dto.id,
    code: dto.code,
    description: dto.description,
    module: dto.module,
    estado: dto.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
  };
}

export const permissionsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<{ items: Permission[]; meta: Record<string, unknown> | null }> {
    const response = await api.get<{ items: PermissionDTO[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor: string | null }>('/auth/permissions', { query });
    if (!response) return { items: [], meta: null };
    const { items, ...meta } = response;
    return { items: items.map(toPermission), meta };
  },

  async getById(id: string): Promise<Permission | null> {
    try {
      const dto = await api.get<PermissionDTO>(`/auth/permissions/${encodeURIComponent(id)}`);
      return dto ? toPermission(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: { code: string; description: string; module: string }): Promise<Permission> {
    const dto = await api.post<PermissionDTO>('/auth/permissions', data);
    return toPermission(dto);
  },

  async update(id: string, changes: { code?: string; description?: string; module?: string }): Promise<Permission> {
    const dto = await api.patch<PermissionDTO>(`/auth/permissions/${encodeURIComponent(id)}`, changes);
    return toPermission(dto);
  },

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<Permission> {
    const dto = await api.patch<PermissionDTO>(`/auth/permissions/${encodeURIComponent(id)}/status`, { estado });
    return toPermission(dto);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/auth/permissions/${encodeURIComponent(id)}`);
  },

  async listRolePermissions(role: string, query?: Record<string, string | number | boolean | undefined | null>): Promise<{ items: Permission[]; meta: Record<string, unknown> | null }> {
    const response = await api.get<{ items: RolePermissionDTO[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor: string | null }>(
      `/auth/roles/${encodeURIComponent(role)}/permissions`,
      { query }
    );
    if (!response) return { items: [], meta: null };
    const { items, ...meta } = response;
    return {
      items: items.map((rp) => toPermission(rp.permission)),
      meta,
    };
  },

  async assignToRole(role: string, permissionId: string): Promise<void> {
    await api.post(`/auth/roles/${encodeURIComponent(role)}/permissions`, { permissionId });
  },

  async removeFromRole(role: string, permissionId: string): Promise<void> {
    await api.delete(`/auth/roles/${encodeURIComponent(role)}/permissions`, { permissionId });
  },
};

interface RolePermissionDTO {
  role: string;
  permissionId: string;
  permission: PermissionDTO;
}

export default permissionsApi;
