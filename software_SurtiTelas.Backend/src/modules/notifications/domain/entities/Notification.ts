export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';

import { BadRequestError } from '../../../../shared/domain/errors';
export interface NotificationData {
  id?: string;
  tipo: NotificationType;
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
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export class Notification {
  readonly id?: string;
  readonly tipo: NotificationType;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly usuarioId?: string;
  readonly modulo?: string;
  readonly referenciaId?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly action?: string;
  readonly actorId?: string;
  readonly targetUserId?: string;
  readonly readAt?: Date;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt?: Date;

  constructor(data: NotificationData) {
    Notification.validate(data);
    this.id = data.id;
    this.tipo = data.tipo;
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.leida = data.leida;
    this.usuarioId = data.usuarioId;
    this.modulo = data.modulo;
    this.referenciaId = data.referenciaId;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.action = data.action;
    this.actorId = data.actorId;
    this.targetUserId = data.targetUserId;
    this.readAt = data.readAt;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
  }

  static validate(data: NotificationData): void {
    if (!data.titulo.trim()) throw new BadRequestError('La notificación debe tener un título');
    if (!data.mensaje.trim()) throw new BadRequestError('La notificación debe tener un mensaje');
  }

  markAsRead(): Notification {
    if (this.leida) return this;
    return new Notification({ ...this, leida: true, readAt: new Date() });
  }
}


