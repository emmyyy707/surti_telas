export type StatusState =
  | 'Pendiente'
  | 'En producción'
  | 'En corte'
  | 'En confección'
  | 'En estampado'
  | 'Empacado'
  | 'Enviado'
  | 'Entregado'
  | 'Cancelado'
  | 'En ruta'
  | 'No entregado'
  | 'Reprogramado';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  change: number;
  variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ChartPoint {
  name: string;
  value: number;
  extra?: number;
}

export interface OrderRecord {
  id: string;
  order: string;
  customer: string;
  items: string;
  status: StatusState;
  total: number;
  date: string;
}

export interface ProductionRecord {
  id: string;
  line: string;
  product: string;
  stage: string;
  progress: number;
  dueDate: string;
}

export interface DeliveryRecord {
  id: string;
  order: string;
  customer: string;
  address: string;
  status: StatusState;
  eta: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  orders: number;
  revenue: number;
  lastContact: string;
  status: 'Nuevo' | 'Activo' | 'Inactivo';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}



