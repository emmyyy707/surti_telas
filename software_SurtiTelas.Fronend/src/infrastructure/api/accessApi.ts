import { api } from './httpClient';

export type AccessAccion = 'Login' | 'Logout' | 'Intento fallido' | 'Acceso concedido' | 'Acceso denegado';
export type AccessEstado = 'Exitoso' | 'Fallido';

export interface AccessLogDTO {
  id: string;
  usuarioId?: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
  accion: AccessAccion;
  ip?: string;
  modulo?: string;
  dispositivo?: string;
  estado: AccessEstado;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  usuarioId?: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
  accion: AccessAccion;
  ip?: string;
  modulo?: string;
  dispositivo?: string;
  estado: AccessEstado;
  createdAt: string;
}

export function toAccessLog(dto: AccessLogDTO): AccessLog {
  return {
    id: dto.id,
    usuarioId: dto.usuarioId,
    usuario: dto.usuario,
    accion: dto.accion,
    ip: dto.ip,
    modulo: dto.modulo,
    dispositivo: dto.dispositivo,
    estado: dto.estado,
    createdAt: dto.createdAt,
  };
}

export const accessApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<AccessLog[]> {
    const response = await api.get<{ items: AccessLogDTO[]; meta: Record<string, unknown> }>('/access-logs', { query });
    const data = response?.items ?? [];
    return data.map(toAccessLog);
  },

  async create(data: { usuario: string; rol: string; modulo: string; accion?: string; permiso?: string; expira?: string | null }): Promise<AccessLog> {
    const dto = await api.post<AccessLogDTO>('/access-logs', data);
    return toAccessLog(dto);
  },

  async update(id: string, data: { usuario?: string; rol?: string; modulo?: string; accion?: string; permiso?: string; expira?: string | null }): Promise<AccessLog | null> {
    try {
      const dto = await api.patch<AccessLogDTO>(`/access-logs/${encodeURIComponent(id)}`, data);
      return dto ? toAccessLog(dto) : null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete<void>(`/access-logs/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return false;
    }
  },
};
