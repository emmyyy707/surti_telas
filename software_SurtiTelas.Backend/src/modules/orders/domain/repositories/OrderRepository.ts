import type { Order, OrderItem, OrderPriority, OrderStatus, OrderFlow, EnvioPrioridad } from '../entities/Order';

export interface CreateOrderInput {
  clienteId?: string;
  asesorId?: string;
  tipoFlujo?: OrderFlow;
  itemsList?: OrderItem[];
  prioridad?: OrderPriority;
  observaciones?: string;
  paymentMethod?: string;
  installments?: number;
  fecha?: string;
  subtotal?: number;
  impuestos?: number;
  descuentos?: number;
  comprobantePagoUrl?: string;
  diasCredito?: number;
  descuentoEspecial?: number;
  envioGratis?: boolean;
  prioridadEnvio?: EnvioPrioridad;
}

export interface OrderFilters {
  estado?: OrderStatus;
  clienteId?: string;
  asesorId?: string;
  domiciliarioId?: string;
  tipoFlujo?: OrderFlow;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'fecha' | 'total' | 'estado';
  order?: 'asc' | 'desc';
  tieneComprobante?: boolean;
  numero?: string;
  search?: string;
}

export interface OrderRepository {
  list(filters?: OrderFilters): Promise<{ data: Order[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Order | null>;
  getByNumero(numero: string): Promise<Order | null>;
  create(input: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, estado: OrderStatus): Promise<Order>;
  cancelOrder(id: string, motivoAnulacion: string): Promise<Order>;
  updateFull(id: string, changes: { clienteId?: string; asesorId?: string; prioridad?: OrderPriority; observaciones?: string; itemsList?: OrderItem[] }): Promise<Order>;
  assignDomiciliario(id: string, domiciliarioId: string): Promise<Order>;
  softDelete(id: string): Promise<void>;
  updatePaymentProof(id: string, data: {
    url: string;
    nombreOriginal: string;
    mime: string;
    tamaño: number;
    cargadoPorId: string;
    estado: string;
    observaciones?: string;
  }): Promise<Order>;
  updateValidation(id: string, data: {
    usuarioValidacionId: string;
    fechaValidacion: Date;
    estado: OrderStatus;
    razonRechazo?: string;
    observacionesRechazo?: string;
    medioPago?: string;
  }): Promise<Order>;
  getWithPaymentProof(id: string): Promise<Order | null>;
  createReceipt(input: { orderId: string; customerId: string; numero: string; total: number; concepto: string; emitidoPor?: string }): Promise<{ id: string }>;
  findReceiptByOrderId(orderId: string): Promise<{ id: string } | null>;
  updateToAccepted(id: string, data: {
    usuarioValidacionId: string;
    fechaValidacion: Date;
    medioPago?: string;
  }): Promise<Order>;
  updateToRejected(id: string, data: {
    usuarioValidacionId: string;
    fechaValidacion: Date;
    razonRechazo: string;
    observacionesRechazo?: string;
  }): Promise<Order>;
  updateReceiptSent(id: string, estadoEnvio: string, fechaEnvio: Date, intentos: number, ultimoError?: string): Promise<Order>;
}
