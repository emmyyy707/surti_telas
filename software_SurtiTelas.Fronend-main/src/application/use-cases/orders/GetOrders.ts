import type { Order } from '@/domain/entities/Order';
import type { OrderRepository } from '@/domain/repositories/OrderRepository';

export class GetOrders {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<Order[]> {
    const orders = await this.orderRepository.list();

    return orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
