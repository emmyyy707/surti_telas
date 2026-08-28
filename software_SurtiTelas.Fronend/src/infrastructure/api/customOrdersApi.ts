export type CustomOrderEstado =
  | 'PENDIENTE'
  | 'ACEPTADO'
  | 'CANCELADO'
  | 'SOLICITUD_RECIBIDA'
  | 'EN_REVISION'
  | 'COTIZADO'
  | 'COTIZACION_ACEPTADA'
  | 'COTIZACION_RECHAZADA'
  | 'PAGO_PENDIENTE'
  | 'PAGO_EN_VERIFICACION'
  | 'PAGO_APROBADO'
  | 'CONVERTIDO_A_PEDIDO'
  | 'EN_PRODUCCION'
  | 'COMPLETADO'
  | 'VENCIDO';

export interface CustomOrderItem {
  id: string;
  pedidoPersonalizadoId: string;
  productoId?: string | null;
  productoNombre?: string | null;
  descripcion: string;
  tipoPersonalizacion: string;
  especificaciones?: string | null;
  cantidad: number;
  unidadMedida?: string | null;
  talla?: string | null;
  color?: string | null;
  material?: string | null;
  ubicacion?: string[] | null;
  distribucionTallas?: Record<string, number> | null;
  imagenesReferencia?: string[] | null;
  customOrderItemId?: string | null;
  referenciaImagen?: string | null;
  archivosReferencia?: string[];
  imagenesAdjuntas?: string[];
  observaciones?: string | null;
  orden: number;
  personalizaciones?: {
    id?: string;
    tipo: string;
    tecnica?: string | null;
    ubicacion?: string[] | null;
    descripcion: string;
    archivos?: string[];
    variantes?: {
      id?: string;
      talla: string;
      color: string;
      cantidad: number;
    }[];
  }[];
}

export interface CotizacionDetalle {
  id: string;
  cotizacionId: string;
  customOrderItemId?: string | null;
  tipo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: string;
  subtotal: string;
  observaciones?: string | null;
  orden: number;
}

export interface Cotizacion {
  id: string;
  pedidoPersonalizadoId: string;
  numeroCotizacion: string;
  estado: string;
  subtotal: string;
  impuestos: string;
  descuento: string;
  total: string;
  tiempoEstimadoDias?: number | null;
  validaHasta?: string | null;
  condicionesPago?: string | null;
  porcentajeAnticipo?: number | null;
  valorAnticipo?: string | null;
  saldo?: string | null;
  observaciones?: string | null;
  enviadaEn?: string | null;
  respondidaEn?: string | null;
  motivoRechazo?: string | null;
  generadoPorId?: string | null;
  generadoPorNombre?: string | null;
  detalles: CotizacionDetalle[];
  negotiationCount?: number;
  negotiationHistory?: any[];
}

export interface NegotiationMessage {
  id: string;
  quoteId: string;
  authorId: string;
  authorRole: string;
  message: string;
  round: number;
  proposalData?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomOrder {
  id: string;
  numeroSolicitud: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  asesorId?: string | null;
  asesorNombre?: string | null;
  estado: CustomOrderEstado;
  descripcionGeneral?: string | null;
  usoFinal?: string | null;
  fechaEntregaDeseada?: string | null;
  fechaLimite?: boolean | null;
  fechaLimiteProduccion?: string | null;
  presupuestoMaximo?: number | null;
  notasCliente?: string | null;
  notasReferencia?: string | null;
  direccionEntrega?: string | null;
  motivoRechazo?: string | null;
  fechaAceptacion?: string | null;
  pedidoNormalId?: string | null;
  orderId?: string | null;
  paymentKey?: string | null;
  paymentProofUrl?: string | null;
  paymentStatus?: string | null;
  anticipoPagado?: boolean | null;
  items: CustomOrderItem[];
  personalizaciones: unknown[];
  cotizacion?: Cotizacion;
  productoNombres?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomOrderListResponse {
  items: CustomOrder[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor: string | null;
}

import { api } from './httpClient';

export interface CustomOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export interface CustomOrderListResponse {
  items: CustomOrder[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor: string | null;
}

export interface CreateCustomOrderInput {
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  descripcionGeneral?: string;
  usoFinal?: string;
  fechaEntregaDeseada?: string;
  fechaLimite?: boolean;
  notasCliente?: string;
  notasReferencia?: string;
  paymentKey?: string;
  paymentProofUrl?: string;
  paymentStatus?: string;
  anticipoPagado?: boolean;
  tecnica?: string;
  tamano?: string;
  cantidadDisenos?: number;
  numeroColores?: string;
  items: {
    productoId?: string;
    productoNombre?: string;
    descripcion: string;
    tipoPersonalizacion: string;
    especificaciones?: string;
    cantidad: number;
    unidadMedida?: string;
    talla?: string;
    color?: string;
    material?: string;
    ubicacion?: string[];
    distribucionTallas?: Record<string, number>;
    distribucionColores?: Record<string, number>;
    imagenesReferencia?: string[];
    referenciaImagen?: string;
    archivosReferencia?: string[];
    imagenesAdjuntas?: string[];
    observaciones?: string;
    orden?: number;
    personalizaciones?: {
      tipo: string;
      tecnica?: string;
      ubicacion?: string[];
      descripcion: string;
      archivos?: string[];
      variantes?: {
        talla: string;
        color: string;
        cantidad: number;
      }[];
    }[];
  }[];
}

export interface QuotationInput {
  subtotal: number;
  impuestos: number;
  descuento: number;
  tiempoEstimadoDias: number;
  validaHasta: string;
  condicionesPago: string;
  observaciones?: string;
  generadoPorId: string;
  generadoPorNombre: string;
  draft?: boolean;
  detalles: {
    tipo: string;
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
    subtotal: number;
    observaciones?: string;
  }[];
}

export interface ConvertToOrderResponse {
  pedidoPersonalizadoId: string;
  orderId: string;
  orderNumero: string;
  estado: CustomOrderEstado;
}

export interface CustomOrderHistoryItem {
  id: string;
  customOrderId: string;
  usuarioId?: string;
  accion: string;
  estadoAnterior: string;
  estadoNuevo: string;
  razon?: string;
  informacion?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CustomOrderMetrics {
  total: number;
  pendientes: number;
  aceptados: number;
  cancelados: number;
  tasaAceptacion: number;
  tasaCancelacion: number;
  promedioHorasPorEstado: Record<string, number>;
}

export interface QuotationDecisionResponse {
  customOrderId: string;
  quotationStatus: string;
  acceptedItems: Array<{ id: string; descripcion: string; subtotal: number }>;
  rejectedItems: Array<{ id: string; descripcion: string; reason: string; comment?: string }>;
  totalAccepted: number;
  orderId?: string;
}

export const customOrdersApi = {
  async list(filters: CustomOrderFilters = {}): Promise<CustomOrderListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.estado) params.append('estado', filters.estado);
    const query = params.toString();
    return api.get<CustomOrderListResponse>('/custom-orders', { query: filters as Record<string, string | number | boolean | undefined | null> });
  },

  async getById(id: string): Promise<CustomOrder | null> {
    try {
      return await api.get<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },

  async create(input: CreateCustomOrderInput): Promise<CustomOrder> {
    return api.post<CustomOrder>('/custom-orders', input);
  },

  async submit(id: string): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/submit`, {});
  },

  async acceptQuotation(id: string): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/accept-quotation`, {});
  },

  async acceptQuotationWithDecisions(
    id: string,
    decisions: {
      acceptedIds: string[];
      rejectedItems: Array<{ detalleId: string; reason: string; comment?: string }>;
    }
  ): Promise<QuotationDecisionResponse> {
    return api.patch<QuotationDecisionResponse>(`/custom-orders/${encodeURIComponent(id)}/accept-quotation-decisions`, decisions);
  },

  async rejectQuotation(id: string, motivoRechazo: string): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/reject-quotation`, { motivoRechazo });
  },

  async sendQuotation(id: string): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/send-quotation`, {});
  },

  async generateQuotation(id: string, input: QuotationInput): Promise<{ pedido: CustomOrder; cotizacion: Cotizacion }> {
    return api.post(`/admin/custom-orders/${encodeURIComponent(id)}/quotation`, input);
  },

  async convertToOrder(id: string): Promise<ConvertToOrderResponse> {
    return api.post<ConvertToOrderResponse>(`/admin/custom-orders/${encodeURIComponent(id)}/convert`, {});
  },

  async update(id: string, changes: Partial<CreateCustomOrderInput>): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/admin/custom-orders/${encodeURIComponent(id)}`, changes);
  },

  async clientUpdate(id: string, changes: Partial<CreateCustomOrderInput>): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}`, changes);
  },

  async updateStatus(id: string, estado: string): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/admin/custom-orders/${encodeURIComponent(id)}/status`, { estado });
  },

  async remove(id: string): Promise<void> {
    return api.delete(`/custom-orders/${encodeURIComponent(id)}`);
  },

  async uploadPaymentProof(id: string, file: File): Promise<{ paymentProofUrl: string }> {
    const form = new FormData();
    form.append('paymentProof', file);
    return api.postForm<{ paymentProofUrl: string }>(`/custom-orders/${encodeURIComponent(id)}/payment-proof`, form);
  },

  getPaymentProofUrl(id: string): string {
    return `/api/v1/custom-orders/${encodeURIComponent(id)}/payment-proof`;
  },

  /**
   * Obtiene el comprobante de pago como una URL temporal (blob) para mostrar en el navegador.
   * Resuelve el problema de autenticación con <img src=""> que no envía headers.
   */
  async getPaymentProofBlobUrl(id: string): Promise<string> {
    const blob = await api.getBlob(`/custom-orders/${encodeURIComponent(id)}/payment-proof`);
    return URL.createObjectURL(blob);
  },

  async uploadReferenceImage(id: string, file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('referenceImage', file);
    return api.postForm<{ url: string }>(`/custom-orders/${encodeURIComponent(id)}/upload-reference`, form);
  },

  async updatePayment(id: string, changes: { paymentKey?: string; paymentProofUrl?: string; paymentStatus?: string; anticipoPagado?: boolean }): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/payment`, changes);
  },

  async adminUpdatePayment(id: string, changes: { paymentKey?: string; paymentProofUrl?: string; paymentStatus?: string; anticipoPagado?: boolean }): Promise<CustomOrder> {
    return api.patch<CustomOrder>(`/admin/custom-orders/${encodeURIComponent(id)}/payment`, changes);
  },

  async history(id: string): Promise<CustomOrderHistoryItem[]> {
    return api.get<CustomOrderHistoryItem[]>(`/custom-orders/${encodeURIComponent(id)}/history`);
  },

  async metrics(): Promise<CustomOrderMetrics> {
    return api.get<CustomOrderMetrics>(`/admin/custom-orders/metrics`);
  },

  async startNegotiation(id: string, message: string, proposalData?: any): Promise<CustomOrder> {
    return api.post<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/negotiation/start`, { message, proposalData });
  },

  async respondToNegotiation(id: string, message: string, proposalData?: any, parentId?: string): Promise<CustomOrder> {
    return api.post<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/negotiation/respond`, { message, proposalData, parentId });
  },

  async acceptNegotiationProposal(id: string, negotiationId: string): Promise<CustomOrder> {
    return api.post<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/negotiation/accept`, { negotiationId });
  },

  async rejectNegotiationProposal(id: string, negotiationId: string, reason?: string): Promise<CustomOrder> {
    return api.post<CustomOrder>(`/custom-orders/${encodeURIComponent(id)}/negotiation/reject`, { negotiationId, reason });
  },

  async getNegotiationHistory(id: string): Promise<NegotiationMessage[]> {
    return api.get<NegotiationMessage[]>(`/custom-orders/${encodeURIComponent(id)}/negotiation`);
  },
};

export default customOrdersApi;
