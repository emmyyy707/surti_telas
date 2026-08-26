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
};

interface RolePermissionDTO {
  role: string;
  permissionId: string;
  permission: PermissionDTO;
}

export default permissionsApi;
