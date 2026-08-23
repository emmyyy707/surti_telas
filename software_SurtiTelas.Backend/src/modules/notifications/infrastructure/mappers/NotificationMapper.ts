import type { JsonValue } from '@prisma/client/runtime/library';
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
  entityType?: string | null;
  entityId?: string | null;
  action?: string | null;
  actorId?: string | null;
  targetUserId?: string | null;
  readAt?: Date | null;
  metadata?: JsonValue | null;
  createdAt: Date;
};

export function toNotificationData(row: NotificationRow): NotificationData {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? (row.metadata as Record<string, unknown>)
    : undefined;

  return {
    id: row.id,
    tipo: row.tipo as NotificationType,
    titulo: row.titulo,
    mensaje: row.mensaje,
    leida: row.leida,
    usuarioId: row.usuarioId ?? undefined,
    modulo: row.modulo ?? undefined,
    referenciaId: row.referenciaId ?? undefined,
    entityType: row.entityType ?? undefined,
    entityId: row.entityId ?? undefined,
    action: row.action ?? undefined,
    actorId: row.actorId ?? undefined,
    targetUserId: row.targetUserId ?? undefined,
    readAt: row.readAt ?? undefined,
    metadata,
    createdAt: row.createdAt,
  };
}
