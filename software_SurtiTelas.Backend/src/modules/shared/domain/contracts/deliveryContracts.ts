export enum DeliveryStatus {
  ASIGNADO = 'ASIGNADO',
  EN_RECOLECCION = 'EN_RECOLECCION',
  EN_RUTA = 'EN_RUTA',
  EN_ENTREGA = 'EN_ENTREGA',
  ENTREGADO = 'ENTREGADO',
  ENTREGADO_FALLIDO = 'ENTREGADO_FALLIDO',
  REASIGNADO = 'REASIGNADO',
}

export interface DeliveryUpdate {
  orderId: string;
  status: DeliveryStatus;
  location?: { lat: number; lng: number };
  observaciones?: string;
}
