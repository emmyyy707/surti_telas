export interface PedidoPersonalizadoData {
  id?: string;
  numeroSolicitud: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  asesorId?: string | null;
  asesorNombre?: string | null;
  estado: string;
  descripcionGeneral?: string | null;
  usoFinal?: string | null;
  fechaEntregaDeseada?: Date | null;
  fechaLimite?: boolean | null;
  fechaLimiteProduccion?: Date | null;
  presupuestoMaximo?: number | null;
  notasCliente?: string | null;
  notasInternas?: string | null;
  notasReferencia?: string | null;
  motivoRechazo?: string | null;
  fechaAceptacion?: Date | null;
  pedidoNormalId?: string | null;
  orderId?: string | null;
  conversacionId?: string | null;
  paymentKey?: string | null;
  paymentProofUrl?: string | null;
  paymentStatus?: string | null;
  anticipoPagado?: boolean | null;
  items?: any[];
  personalizaciones?: any[];
  cotizacion?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class PedidoPersonalizado {
  readonly id?: string;
  numeroSolicitud: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  asesorId?: string | null;
  asesorNombre?: string | null;
  estado: string;
  descripcionGeneral?: string | null;
  usoFinal?: string | null;
  fechaEntregaDeseada?: Date | null;
  fechaLimite?: boolean | null;
  fechaLimiteProduccion?: Date | null;
  presupuestoMaximo?: number | null;
  notasCliente?: string | null;
  notasInternas?: string | null;
  notasReferencia?: string | null;
  motivoRechazo?: string | null;
  fechaAceptacion?: Date | null;
  pedidoNormalId?: string | null;
  orderId?: string | null;
  conversacionId?: string | null;
  paymentKey?: string | null;
  paymentProofUrl?: string | null;
  paymentStatus?: string | null;
  anticipoPagado?: boolean | null;
  items: any[];
  personalizaciones: any[];
  cotizacion?: any;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;

  constructor(data: PedidoPersonalizadoData) {
    this.id = data.id;
    this.numeroSolicitud = data.numeroSolicitud;
    this.clienteId = data.clienteId;
    this.clienteNombre = data.clienteNombre;
    this.clienteEmail = data.clienteEmail ?? null;
    this.clienteTelefono = data.clienteTelefono ?? null;
    this.asesorId = data.asesorId ?? null;
    this.asesorNombre = data.asesorNombre ?? null;
    this.estado = data.estado;
    this.descripcionGeneral = data.descripcionGeneral ?? null;
    this.usoFinal = data.usoFinal ?? null;
    this.fechaEntregaDeseada = data.fechaEntregaDeseada ?? null;
    this.fechaLimite = data.fechaLimite ?? null;
    this.fechaLimiteProduccion = data.fechaLimiteProduccion ?? null;
    this.presupuestoMaximo = data.presupuestoMaximo ?? null;
    this.notasCliente = data.notasCliente ?? null;
    this.notasInternas = data.notasInternas ?? null;
    this.notasReferencia = data.notasReferencia ?? null;
    this.motivoRechazo = data.motivoRechazo ?? null;
    this.fechaAceptacion = data.fechaAceptacion ?? null;
    this.pedidoNormalId = data.pedidoNormalId ?? null;
    this.orderId = data.orderId ?? null;
    this.conversacionId = data.conversacionId ?? null;
    this.paymentKey = data.paymentKey ?? null;
    this.paymentProofUrl = data.paymentProofUrl ?? null;
    this.paymentStatus = data.paymentStatus ?? null;
    this.anticipoPagado = data.anticipoPagado ?? null;
    this.items = data.items ?? [];
    this.personalizaciones = data.personalizaciones ?? [];
    this.cotizacion = data.cotizacion;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  toDTO() {
    return {
      id: this.id,
      numeroSolicitud: this.numeroSolicitud,
      clienteId: this.clienteId,
      clienteNombre: this.clienteNombre,
      clienteEmail: this.clienteEmail,
      clienteTelefono: this.clienteTelefono,
      asesorId: this.asesorId,
      asesorNombre: this.asesorNombre,
      estado: this.estado,
      descripcionGeneral: this.descripcionGeneral,
      usoFinal: this.usoFinal,
      fechaEntregaDeseada: this.fechaEntregaDeseada ? new Date(this.fechaEntregaDeseada).toISOString() : null,
      fechaLimite: this.fechaLimite,
      fechaLimiteProduccion: this.fechaLimiteProduccion ? new Date(this.fechaLimiteProduccion).toISOString() : null,
      presupuestoMaximo: this.presupuestoMaximo,
      notasCliente: this.notasCliente,
      notasInternas: this.notasInternas,
      notasReferencia: this.notasReferencia,
      motivoRechazo: this.motivoRechazo,
      fechaAceptacion: this.fechaAceptacion ? new Date(this.fechaAceptacion).toISOString() : null,
      pedidoNormalId: this.pedidoNormalId,
      orderId: this.orderId,
      conversacionId: this.conversacionId,
      paymentKey: this.paymentKey,
      paymentProofUrl: this.paymentProofUrl,
      paymentStatus: this.paymentStatus,
      anticipoPagado: this.anticipoPagado,
      items: this.items,
      personalizaciones: this.personalizaciones,
      cotizacion: this.cotizacion,
      createdAt: this.createdAt ? new Date(this.createdAt).toISOString() : null,
      updatedAt: this.updatedAt ? new Date(this.updatedAt).toISOString() : null,
    };
  }
}
