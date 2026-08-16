export interface CotizacionData {
  id?: string;
  pedidoPersonalizadoId: string;
  numeroCotizacion: string;
  estado: string;
  subtotal: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  tiempoEstimadoDias?: number | null;
  validaHasta?: Date | null;
  condicionesPago?: string | null;
  porcentajeAnticipo?: number | null;
  valorAnticipo?: number | null;
  saldo?: number | null;
  observaciones?: string | null;
  enviadaEn?: Date | null;
  respondidaEn?: Date | null;
  motivoRechazo?: string | null;
  generadoPorId?: string | null;
  generadoPorNombre?: string | null;
  detalles?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  negotiationCount?: number;
  negotiationHistory?: any[];
}

export class Cotizacion {
  readonly id?: string;
  pedidoPersonalizadoId: string;
  numeroCotizacion: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  tiempoEstimadoDias?: number | null;
  validaHasta?: Date | null;
  condicionesPago?: string | null;
  porcentajeAnticipo?: number | null;
  valorAnticipo?: number | null;
  saldo?: number | null;
  observaciones?: string | null;
  enviadaEn?: Date | null;
  respondidaEn?: Date | null;
  motivoRechazo?: string | null;
  generadoPorId?: string | null;
  generadoPorNombre?: string | null;
  detalles: any[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  negotiationCount?: number;
  negotiationHistory?: any[];

  constructor(data: CotizacionData) {
    this.id = data.id;
    this.pedidoPersonalizadoId = data.pedidoPersonalizadoId;
    this.numeroCotizacion = data.numeroCotizacion;
    this.estado = data.estado;
    this.subtotal = data.subtotal;
    this.impuestos = data.impuestos ?? 0;
    this.descuento = data.descuento ?? 0;
    this.total = data.total;
    this.tiempoEstimadoDias = data.tiempoEstimadoDias ?? null;
    this.validaHasta = data.validaHasta ?? null;
    this.condicionesPago = data.condicionesPago ?? null;
    this.porcentajeAnticipo = data.porcentajeAnticipo ?? null;
    this.valorAnticipo = data.valorAnticipo ?? null;
    this.saldo = data.saldo ?? null;
    this.observaciones = data.observaciones ?? null;
    this.enviadaEn = data.enviadaEn ?? null;
    this.respondidaEn = data.respondidaEn ?? null;
    this.motivoRechazo = data.motivoRechazo ?? null;
    this.generadoPorId = data.generadoPorId ?? null;
    this.generadoPorNombre = data.generadoPorNombre ?? null;
    this.detalles = data.detalles ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.negotiationCount = data.negotiationCount ?? 0;
    this.negotiationHistory = data.negotiationHistory ?? [];
  }

  toDTO() {
    return {
      id: this.id,
      pedidoPersonalizadoId: this.pedidoPersonalizadoId,
      numeroCotizacion: this.numeroCotizacion,
      estado: this.estado,
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      descuento: this.descuento,
      total: this.total,
      tiempoEstimadoDias: this.tiempoEstimadoDias,
      validaHasta: this.validaHasta,
      condicionesPago: this.condicionesPago,
      porcentajeAnticipo: this.porcentajeAnticipo,
      valorAnticipo: this.valorAnticipo,
      saldo: this.saldo,
      observaciones: this.observaciones,
      enviadaEn: this.enviadaEn,
      respondidaEn: this.respondidaEn,
      motivoRechazo: this.motivoRechazo,
      generadoPorId: this.generadoPorId,
      generadoPorNombre: this.generadoPorNombre,
      detalles: this.detalles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      negotiationCount: this.negotiationCount,
      negotiationHistory: this.negotiationHistory,
    };
  }
}
