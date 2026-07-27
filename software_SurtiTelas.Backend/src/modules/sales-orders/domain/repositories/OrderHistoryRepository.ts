import type { OrderHistory } from '../entities/OrderHistory';

export type { OrderHistory } from '../entities/OrderHistory';

export interface OrderHistoryRepository {
  create(history: Omit<OrderHistory, 'id' | 'createdAt'>): Promise<OrderHistory>;
  findByPedidoId(pedidoId: string): Promise<OrderHistory[]>;
}
