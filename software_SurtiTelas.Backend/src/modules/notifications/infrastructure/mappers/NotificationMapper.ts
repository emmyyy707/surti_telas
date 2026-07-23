import type { NotificationData, NotificationType } from '../../domain/entities/Notification';

type NotificationRow = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId: string | null;
  createdAt: Date;
};

export function toNotificationData(row: NotificationRow): NotificationData {
  return {
    id: row.id,
    tipo: row.tipo as NotificationType,
    titulo: row.titulo,
    mensaje: row.mensaje,
    leida: row.leida,
    usuarioId: row.usuarioId ?? undefined,
    createdAt: row.createdAt,
  };
}
