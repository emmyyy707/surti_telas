export interface CotizacionDetalleData {
  id?: string;
  cotizacionId?: string;
  customOrderItemId?: string | null;
  tipo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida?: string | null;
  precioUnitario: number;
  subtotal: number;
  observaciones?: string | null;
  orden?: number;
  createdAt?: Date;
}

export class CotizacionDetalle {
  readonly id?: string;
  cotizacionId?: string;
  customOrderItemId?: string | null;
  tipo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida?: string | null;
  precioUnitario: number;
  subtotal: number;
  observaciones?: string | null;
  orden: number;
  readonly createdAt?: Date;

  constructor(data: CotizacionDetalleData) {
    this.id = data.id;
    this.cotizacionId = data.cotizacionId;
    this.customOrderItemId = data.customOrderItemId ?? null;
    this.tipo = data.tipo;
    this.descripcion = data.descripcion;
    this.cantidad = data.cantidad;
    this.unidadMedida = data.unidadMedida ?? null;
    this.precioUnitario = data.precioUnitario;
    this.subtotal = data.subtotal;
    this.observaciones = data.observaciones ?? null;
    this.orden = data.orden ?? 0;
    this.createdAt = data.createdAt;
  }

  toDTO() {
    return {
      id: this.id,
      cotizacionId: this.cotizacionId,
      customOrderItemId: this.customOrderItemId,
      tipo: this.tipo,
      descripcion: this.descripcion,
      cantidad: this.cantidad,
      unidadMedida: this.unidadMedida,
      precioUnitario: this.precioUnitario,
      subtotal: this.subtotal,
      observaciones: this.observaciones,
      orden: this.orden,
      createdAt: this.createdAt,
    };
  }
}
