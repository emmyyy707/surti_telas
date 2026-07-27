export interface SaleData {
  id: string;
  orderId: string;
  clienteId: string;
  clienteNombre: string;
  asesorId: string;
  asesorNombre: string;
  fechaVenta: string;
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  estado: string;
  medioPago?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Sale {
  readonly id: string;
  readonly orderId: string;
  readonly clienteId: string;
  readonly clienteNombre: string;
  readonly asesorId: string;
  readonly asesorNombre: string;
  readonly fechaVenta: string;
  readonly subtotal: number;
  readonly impuestos: number;
  readonly descuentos: number;
  readonly total: number;
  readonly estado: string;
  readonly medioPago?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;

  constructor(data: SaleData) {
    Sale.validate(data);

    this.id = data.id;
    this.orderId = data.orderId;
    this.clienteId = data.clienteId;
    this.clienteNombre = data.clienteNombre;
    this.asesorId = data.asesorId;
    this.asesorNombre = data.asesorNombre;
    this.fechaVenta = data.fechaVenta;
    this.subtotal = data.subtotal;
    this.impuestos = data.impuestos;
    this.descuentos = data.descuentos;
    this.total = data.total;
    this.estado = data.estado;
    this.medioPago = data.medioPago;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data: SaleData): void {
    if (!data.id.trim()) throw new Error('La venta debe tener un identificador');
    if (!data.orderId.trim()) throw new Error('La venta debe estar asociada a un pedido');
    if (!data.clienteId.trim()) throw new Error('La venta debe tener un cliente');
    if (!data.asesorId.trim()) throw new Error('La venta debe tener un asesor');
    if (!Number.isFinite(data.total) || data.total < 0) {
      throw new Error('El total de la venta debe ser mayor o igual a cero');
    }
  }
}
