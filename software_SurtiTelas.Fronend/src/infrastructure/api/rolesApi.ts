import { api } from './httpClient';

export type RoleName = 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE' | 'ALMACEN' | 'PRODUCCION' | 'REPORTES';

export interface RoleDTO {
  id?: string;
  nombre: string;
  descripcion?: string;
  permisos?: string[];
  usuarios?: number;
  estado?: 'Activo' | 'Inactivo';
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuarios: number;
  estado: 'Activo' | 'Inactivo';
}

export function toRole(dto: RoleDTO, index: number): Rol {
  const id = dto.id ?? `R-${String(index + 1).padStart(3, '0')}`;
  return {
    id,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? '',
    permisos: dto.permisos ?? [],
    usuarios: dto.usuarios ?? 0,
    estado: dto.estado ?? 'Activo',
  };
}

export const rolesApi = {
  async list(): Promise<Rol[]> {
    const response = await api.get<RoleDTO[] | { items: RoleDTO[]; meta: Record<string, unknown> }>('/auth/roles');
    const raw = Array.isArray(response) ? response : response?.items;
    return raw.map(toRole);
  },

  async getById(id: string): Promise<Rol | null> {
    try {
      const dto = await api.get<RoleDTO>(`/auth/roles/${encodeURIComponent(id)}`);
      return dto ? toRole(dto, 0) : null;
    } catch {
      return null;
    }
  },

  async create(data: { nombre: string; descripcion?: string; permisos?: string[] }): Promise<Rol> {
    const dto = await api.post<RoleDTO>('/auth/roles', data);
    return toRole(dto, 0);
  },

  async update(id: string, data: { nombre?: string; descripcion?: string; permisos?: string[] }): Promise<Rol> {
    const dto = await api.patch<RoleDTO>(`/auth/roles/${encodeURIComponent(id)}`, data);
    if (!dto) throw new Error('Respuesta vacía del servidor');
    return toRole(dto, 0);
  },

  async updateStatus(id: string, estado: 'Activo' | 'Inactivo'): Promise<Rol> {
    const dto = await api.patch<RoleDTO>(`/auth/roles/${encodeURIComponent(id)}/status`, { estado });
    if (!dto) throw new Error('Respuesta vacía del servidor');
    return toRole(dto, 0);
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/auth/roles/${encodeURIComponent(id)}`);
  },
};

export default rolesApi;
