export type AlertType = 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
export type AlertState = 'PENDIENTE' | 'LEIDA' | 'RESUELTA' | 'CANCELADA';
export type AlertPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface AlertData {
  id?: string;
  tipo: AlertType;
  modulo: string;
  referenciaId?: string;
  mensaje: string;
  estado?: AlertState;
  prioridad?: AlertPriority;
  leida: boolean;
  leidaPorId?: string;
  resueltaPorId?: string;
  resueltaEn?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Alert {
  readonly id?: string;
  readonly tipo: AlertType;
  readonly modulo: string;
  readonly referenciaId?: string;
  readonly mensaje: string;
  readonly estado: AlertState;
  readonly prioridad: AlertPriority;
  readonly leida: boolean;
  readonly leidaPorId?: string;
  readonly resueltaPorId?: string;
  readonly resueltaEn?: Date;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;

  constructor(data: AlertData) {
    Alert.validate(data);
    this.id = data.id;
    this.tipo = data.tipo;
    this.modulo = data.modulo;
    this.referenciaId = data.referenciaId;
    this.mensaje = data.mensaje;
    this.estado = data.estado ?? 'PENDIENTE';
    this.prioridad = data.prioridad ?? 'MEDIA';
    this.leida = data.leida;
    this.leidaPorId = data.leidaPorId;
    this.resueltaPorId = data.resueltaPorId;
    this.resueltaEn = data.resueltaEn;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static validate(data: AlertData): void {
    if (!data.tipo) throw new Error('La alerta debe tener un tipo');
    if (!data.modulo.trim()) throw new Error('La alerta debe tener un módulo');
    if (!data.mensaje.trim()) throw new Error('La alerta debe tener un mensaje');
  }

  markAsRead(usuarioId: string): Alert {
    if (this.leida) return this;
    return new Alert({ ...this, leida: true, leidaPorId: usuarioId, estado: 'LEIDA' });
  }

  markAsResolved(usuarioId: string): Alert {
    if (this.estado === 'RESUELTA') return this;
    return new Alert({
      ...this,
      estado: 'RESUELTA',
      resueltaPorId: usuarioId,
      resueltaEn: new Date(),
    });
  }

  cancel(): Alert {
    if (this.estado === 'CANCELADA') return this;
    return new Alert({ ...this, estado: 'CANCELADA' });
  }
}
