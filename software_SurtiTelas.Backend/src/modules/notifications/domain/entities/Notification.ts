export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';

export interface NotificationData {
  id?: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  leida: boolean;
  usuarioId?: string;
  createdAt?: Date;
}

export class Notification {
  readonly id?: string;
  readonly tipo: NotificationType;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly usuarioId?: string;
  readonly createdAt?: Date;

  constructor(data: NotificationData) {
    Notification.validate(data);
    this.id = data.id;
    this.tipo = data.tipo;
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.leida = data.leida;
    this.usuarioId = data.usuarioId;
    this.createdAt = data.createdAt;
  }

  static validate(data: NotificationData): void {
    if (!data.titulo.trim()) throw new Error('La notificación debe tener un título');
    if (!data.mensaje.trim()) throw new Error('La notificación debe tener un mensaje');
  }

  markAsRead(): Notification {
    if (this.leida) return this;
    return new Notification({ ...this, leida: true });
  }
}
