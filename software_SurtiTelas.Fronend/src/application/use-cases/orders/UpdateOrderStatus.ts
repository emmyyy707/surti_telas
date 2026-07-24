import type { Order, OrderStatus } from '@/domain/entities/Order';
import type { OrderRepository } from '@/domain/repositories/OrderRepository';

export class UpdateOrderStatus {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, estado: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.getById(id);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (!order.canTransitionTo(estado)) {
      throw new Error(`No se puede cambiar el pedido ${order.id} de ${order.estado} a ${estado}`);
    }

    return this.orderRepository.updateStatus(id, estado);
  }
}
