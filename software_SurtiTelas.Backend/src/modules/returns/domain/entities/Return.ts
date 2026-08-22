export type ReturnEstado = 'RECIBIDO' | 'EN_INSPECCION' | 'APROBADO' | 'RECHAZADO' | 'EN_REPARACION' | 'REINGRESADO' | 'DESCARTADO';
export type ReturnDestino = 'REINGRESO_INVENTARIO' | 'REPARACION' | 'DESCARTE' | 'DEVOLUCION_PROVEEDOR';

export interface ReturnData {
  id?: string;
  numeroDevolucion: string;
  orderId?: string | null;
  prenda?: string | null;
  referencia?: string | null;
  motivo?: string | null;
  cantidad: number;
  cantidadInspeccionada: number;
  fechaDevolucion: Date;
  estado: ReturnEstado;
  destino: ReturnDestino;
  cliente?: string | null;
  clienteId?: string | null;
  responsable?: string | null;
  observaciones?: string | null;
  imagenes?: string[];
  numeroOrden?: string | null;
  fechaOrden?: string | null;
  estadoOrden?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReturnFilters {
  estado?: ReturnEstado;
  cliente?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
}

export interface ReturnListResult {
  data: ReturnData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    nextCursor?: string;
  };
}

export class Return {
  readonly id?: string;
  numeroDevolucion: string;
  orderId?: string | null;
  prenda?: string | null;
  referencia?: string | null;
  motivo?: string | null;
  cantidad: number;
  cantidadInspeccionada: number;
  fechaDevolucion: Date;
  estado: ReturnEstado;
  destino: ReturnDestino;
  cliente?: string | null;
  clienteId?: string | null;
  responsable?: string | null;
  observaciones?: string | null;
  imagenes: string[];
  numeroOrden?: string | null;
  fechaOrden?: string | null;
  estadoOrden?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: ReturnData) {
    this.id = data.id;
    this.numeroDevolucion = data.numeroDevolucion;
    this.orderId = data.orderId ?? null;
    this.prenda = data.prenda ?? null;
    this.referencia = data.referencia ?? null;
    this.motivo = data.motivo ?? null;
    this.cantidad = data.cantidad;
    this.cantidadInspeccionada = data.cantidadInspeccionada;
    this.fechaDevolucion = data.fechaDevolucion;
    this.estado = data.estado;
    this.destino = data.destino;
    this.cliente = data.cliente ?? null;
    this.clienteId = data.clienteId ?? null;
    this.responsable = data.responsable ?? null;
    this.observaciones = data.observaciones ?? null;
    this.imagenes = data.imagenes ?? [];
    this.numeroOrden = data.numeroOrden ?? null;
    this.fechaOrden = data.fechaOrden ?? null;
    this.estadoOrden = data.estadoOrden ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  cambiarEstado(estado: ReturnEstado) {
    this.estado = estado;
  }

  reingresar() {
    this.estado = 'REINGRESADO';
    this.destino = 'REINGRESO_INVENTARIO';
  }

  toDTO() {
    return {
      id: this.id,
      numeroDevolucion: this.numeroDevolucion,
      orderId: this.orderId,
      prenda: this.prenda,
      referencia: this.referencia,
      motivo: this.motivo,
      cantidad: this.cantidad,
      cantidadInspeccionada: this.cantidadInspeccionada,
      fechaDevolucion: this.fechaDevolucion,
      estado: this.estado,
      destino: this.destino,
      cliente: this.cliente,
      clienteId: this.clienteId,
      responsable: this.responsable,
      observaciones: this.observaciones,
      imagenes: this.imagenes,
      numeroOrden: this.numeroOrden,
      fechaOrden: this.fechaOrden,
      estadoOrden: this.estadoOrden,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
