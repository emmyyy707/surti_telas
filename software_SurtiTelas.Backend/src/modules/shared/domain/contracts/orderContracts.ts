export enum OrderStatus {
  NUEVO = 'NUEVO',
  EN_VALIDACION = 'EN_VALIDACION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  EN_PRODUCCION = 'EN_PRODUCCION',
  EN_ALMACEN = 'EN_ALMACEN',
  EN_DESPACHO = 'EN_DESPACHO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export interface OrderSummary {
  orderId: string;
  orderNumero: string;
  estado: OrderStatus;
  clienteId: string;
  clienteNombre: string;
  asesorId: string;
  asesorNombre: string;
  total: number;
  fecha: Date;
}

export interface DeliveryTracking {
  orderId: string;
  orderNumero: string;
  estado: OrderStatus;
  trackingEvents: Array<{
    timestamp: Date;
    status: string;
    description: string;
    location?: { lat: number; lng: number };
  }>;
  estimatedDelivery: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface CommissionState {
  asesorId: string;
  asesorNombre: string;
  totalVentas: number;
  comisionTotal: number;
  ventasCount: number;
  ultimoPago?: Date;
  estado: 'pending' | 'paid' | 'partially_paid';
}

export interface PaymentState {
  orderId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  completedAt?: Date;
}
