import type { Notification, NotificationType } from '../entities/Notification';

export interface NotificationFilters {
  usuarioId?: string;
  leida?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'createdAt' | 'leida';
  order?: 'asc' | 'desc';
}

export interface NotificationRepository {
  list(filters?: NotificationFilters): Promise<{ data: Notification[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string, usuarioId?: string): Promise<Notification | null>;
  create(input: {
    tipo: NotificationType;
    titulo: string;
    mensaje: string;
    usuarioId?: string;
    modulo?: string;
    referenciaId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    actorId?: string;
    targetUserId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification>;
  update(id: string, usuarioId: string, changes: { titulo?: string; mensaje?: string; leida?: boolean; readAt?: Date }): Promise<Notification>;
  markAsRead(id: string, usuarioId: string): Promise<Notification>;
  markAllAsRead(usuarioId: string): Promise<number>;
  delete(id: string, usuarioId: string): Promise<void>;
}
