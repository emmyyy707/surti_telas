import { BadRequestError } from '../../../../shared/domain/errors';
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
  motivoAnulacion?: string;
  medioPago?: string;
  createdAt?: string;
  updatedAt?: string;
  paymentId?: string | null;
  tipoPago?: string | null;
  numeroCuota?: number | null;
  totalCuotas?: number | null;
  esAnticipo?: boolean | null;
  esSaldo?: boolean | null;
  paymentStatus?: string | null;
  comprobantePagoUrl?: string | null;
  registradoPorId?: string | null;
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
  readonly motivoAnulacion?: string;
  readonly medioPago?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly paymentId?: string | null;
  readonly tipoPago?: string | null;
  readonly numeroCuota?: number | null;
  readonly totalCuotas?: number | null;
  readonly esAnticipo?: boolean | null;
  readonly esSaldo?: boolean | null;
  readonly paymentStatus?: string | null;
  readonly comprobantePagoUrl?: string | null;
  readonly registradoPorId?: string | null;

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
    this.motivoAnulacion = data.motivoAnulacion;
    this.medioPago = data.medioPago;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.paymentId = data.paymentId ?? null;
    this.tipoPago = data.tipoPago ?? null;
    this.numeroCuota = data.numeroCuota ?? null;
    this.totalCuotas = data.totalCuotas ?? null;
    this.esAnticipo = data.esAnticipo ?? null;
    this.esSaldo = data.esSaldo ?? null;
    this.paymentStatus = data.paymentStatus ?? null;
    this.comprobantePagoUrl = data.comprobantePagoUrl ?? null;
    this.registradoPorId = data.registradoPorId ?? null;
  }

  static validate(data: SaleData): void {
    if (!data.id.trim()) throw new BadRequestError('La venta debe tener un identificador');
    if (!data.orderId.trim()) throw new BadRequestError('La venta debe estar asociada a un pedido');
    if (!data.clienteId.trim()) throw new BadRequestError('La venta debe tener un cliente');
    if (!data.asesorId.trim()) throw new BadRequestError('La venta debe tener un asesor');
    if (!Number.isFinite(data.total) || data.total < 0) {
      throw new BadRequestError('El total de la venta debe ser mayor o igual a cero');
    }
  }
}


