import { api } from './httpClient';

export interface NotificationDTO {
  id: string;
  tipo: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId?: string;
  modulo?: string;
  referenciaId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  targetUserId?: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
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
  modulo?: string;
  referenciaId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  targetUserId?: string;
  readAt?: number;
  metadata?: Record<string, unknown>;
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
    modulo: dto.modulo,
    referenciaId: dto.referenciaId,
    entityType: dto.entityType,
    entityId: dto.entityId,
    action: dto.action,
    actorId: dto.actorId,
    targetUserId: dto.targetUserId,
    readAt: dto.readAt ? new Date(dto.readAt).getTime() : undefined,
    metadata: dto.metadata,
    createdAt: new Date(dto.createdAt).getTime(),
  };
}

export const notificationsApi = {
  async list(): Promise<Notification[]> {
    // No ocultamos el 401/403: useRealtimeNotifications y httpClient lo necesitan
    // para limpiar tokens, intentar refresh y detener el polling.
    const response = await api.get<{ items: NotificationDTO[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor: string | null }>('/notifications');
    const data = response?.items ?? [];
    return data.map(toNotification);
  },

  async getUnreadCount(): Promise<number> {
    // No ocultamos el 401/403 por la misma razón que list().
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response?.count ?? 0;
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

  async markAsRead(id: string): Promise<Notification | null> {
    try {
      const dto = await api.patch<NotificationDTO>(`/notifications/${encodeURIComponent(id)}/read`, {});
      return dto ? toNotification(dto) : null;
    } catch {
      return null;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await api.patch<void>('/notifications/read-all', {});
      return true;
    } catch {
      return false;
    }
  },

  async deleteAll(): Promise<boolean> {
    try {
      await api.delete<void>('/notifications');
      return true;
    } catch {
      return false;
    }
  },

  async getSidebarSummary(): Promise<Record<string, number>> {
    // No ocultamos el 401/403: useRealtimeNotifications lo necesita para detener el polling.
    const response = await api.get<Record<string, number>>('/notifications/sidebar-summary');
    return response ?? {};
  },
};
