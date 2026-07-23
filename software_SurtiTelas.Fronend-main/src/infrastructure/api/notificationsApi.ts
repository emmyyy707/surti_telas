import { api } from './httpClient';

export interface NotificationDTO {
  id: string;
  tipo: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  tipo: 'info' | 'warning' | 'success' | 'danger';
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId?: string;
  createdAt: number;
}

export function toNotification(dto: NotificationDTO): Notification {
  return {
    id: dto.id,
    tipo: dto.tipo.toLowerCase() as Notification['tipo'],
    titulo: dto.titulo,
    mensaje: dto.mensaje,
    leida: dto.leida,
    usuarioId: dto.usuarioId,
    createdAt: new Date(dto.createdAt).getTime(),
  };
}

export const notificationsApi = {
  async list(): Promise<Notification[]> {
    const response = await api.get<{ items: NotificationDTO[]; meta: Record<string, unknown> }>('/notifications');
    const data = response?.items ?? [];
    return data.map(toNotification);
  },

  async create(data: { titulo: string; mensaje: string; tipo?: NotificationDTO['tipo'] }): Promise<Notification> {
    const dto = await api.post<NotificationDTO>('/notifications', data);
    return toNotification(dto);
  },

  async update(id: string, data: { titulo?: string; mensaje?: string; leida?: boolean }): Promise<Notification | null> {
    try {
      const dto = await api.patch<NotificationDTO>(`/notifications/${encodeURIComponent(id)}`, data);
      return dto ? toNotification(dto) : null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete<void>(`/notifications/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return false;
    }
  },
};
