import type { NotificationData, NotificationType } from '../../domain/entities/Notification';

type NotificationRow = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId: string | null;
  modulo?: string | null;
  referenciaId?: string | null;
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
    modulo: row.modulo ?? undefined,
    referenciaId: row.referenciaId ?? undefined,
    createdAt: row.createdAt,
  };
}
