import type { Order, OrderItem, OrderPriority, OrderStatus } from '../entities/Order';

export interface CreateOrderInput {
  clienteId: string;
  asesorId: string;
  itemsList?: OrderItem[];
  prioridad?: OrderPriority;
  observaciones?: string;
  paymentMethod?: string;
  installments?: number;
  fecha?: string;
}

export interface OrderFilters {
  estado?: OrderStatus;
  clienteId?: string;
  asesorId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'fecha' | 'total' | 'estado';
  order?: 'asc' | 'desc';
}

export interface OrderRepository {
  list(filters?: OrderFilters): Promise<{ data: Order[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Order | null>;
  create(input: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, estado: OrderStatus): Promise<Order>;
  updateFull(id: string, changes: { clienteId?: string; asesorId?: string; prioridad?: OrderPriority; observaciones?: string; itemsList?: OrderItem[] }): Promise<Order>;
  assignDomiciliario(id: string, domiciliarioId: string): Promise<Order>;
  softDelete(id: string): Promise<void>;
}
