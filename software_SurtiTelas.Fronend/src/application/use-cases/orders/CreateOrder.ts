import type { CreateOrderInput, OrderRepository } from '@/domain/repositories/OrderRepository';
import type { Order } from '@/domain/entities/Order';

export class CreateOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    return this.orderRepository.create(input);
  }
}
