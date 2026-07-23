export interface ContactMessageData {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  leida: boolean;
  respondida: boolean;
  respuesta?: string;
  respondidoPor?: string;
  respondidoEn?: Date;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ContactMessage {
  readonly id?: string;
  readonly nombre: string;
  readonly email: string;
  readonly telefono?: string;
  readonly asunto: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly respondida: boolean;
  readonly respuesta?: string;
  readonly respondidoPor?: string;
  readonly respondidoEn?: Date;
  readonly estado: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;

  constructor(data: ContactMessageData) {
    ContactMessage.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.email = data.email;
    this.telefono = data.telefono;
    this.asunto = data.asunto;
    this.mensaje = data.mensaje;
    this.leida = data.leida;
    this.respondida = data.respondida;
    this.respuesta = data.respuesta;
    this.respondidoPor = data.respondidoPor;
    this.respondidoEn = data.respondidoEn;
    this.estado = data.estado ?? 'NUEVO';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static validate(data: ContactMessageData): void {
    if (!data.nombre.trim()) throw new Error('El nombre es obligatorio');
    if (!data.email.trim()) throw new Error('El email es obligatorio');
    if (!data.asunto.trim()) throw new Error('El asunto es obligatorio');
    if (!data.mensaje.trim()) throw new Error('El mensaje es obligatorio');
  }

  markAsRead(): ContactMessage {
    if (this.leida) return this;
    return new ContactMessage({ ...this, leida: true });
  }

  reply(respuesta: string, respondidoPor: string): ContactMessage {
    const now = new Date();
    return new ContactMessage({
      ...this,
      leida: true,
      respondida: true,
      respuesta,
      respondidoPor,
      respondidoEn: now,
      estado: 'RESPONDIDO',
    });
  }

  close(): ContactMessage {
    return new ContactMessage({
      ...this,
      estado: 'CERRADO',
    });
  }
}
