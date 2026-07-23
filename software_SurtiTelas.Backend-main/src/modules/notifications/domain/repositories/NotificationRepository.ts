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
  getById(id: string): Promise<Notification | null>;
  create(input: { tipo: NotificationType; titulo: string; mensaje: string; usuarioId?: string }): Promise<Notification>;
  update(id: string, changes: { titulo?: string; mensaje?: string; leida?: boolean }): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  delete(id: string): Promise<void>;
}
