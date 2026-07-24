export interface AuditLogData {
  id?: string;
  usuarioId?: string | null;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
  accion: string;
  modulo: string;
  referenciaId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
  createdAt?: Date;
}

export class AuditLog {
  readonly id?: string;
  readonly usuarioId?: string | null;
  readonly usuario?: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
  readonly accion: string;
  readonly modulo: string;
  readonly referenciaId?: string | null;
  readonly ip?: string | null;
  readonly userAgent?: string | null;
  readonly metadata?: unknown;
  readonly createdAt?: Date;

  constructor(data: AuditLogData) {
    this.id = data.id;
    this.usuarioId = data.usuarioId;
    this.usuario = data.usuario;
    this.accion = data.accion;
    this.modulo = data.modulo;
    this.referenciaId = data.referenciaId;
    this.ip = data.ip;
    this.userAgent = data.userAgent;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
  }
}
