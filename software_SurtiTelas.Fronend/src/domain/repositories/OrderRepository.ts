import type { Order, OrderPriority, OrderStatus } from '@/domain/entities/Order';

export interface CreateOrderInput {
  id?: string;
  cliente: string;
  asesor: string;
  fecha?: string;
  itemsList: Array<{
    productId?: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  prioridad?: OrderPriority;
  observaciones?: string;
}

export interface OrderRepository {
  list(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(input: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, estado: OrderStatus): Promise<Order>;
}
