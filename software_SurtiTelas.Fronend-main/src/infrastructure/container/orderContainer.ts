import { CreateOrder } from '@/application/use-cases/orders/CreateOrder';
import { GetOrders } from '@/application/use-cases/orders/GetOrders';
import { UpdateOrderStatus } from '@/application/use-cases/orders/UpdateOrderStatus';
import { ApiOrderRepository } from '@/infrastructure/repositories/ApiOrderRepository';

const orderRepository = new ApiOrderRepository();

export const orderUseCases = {
  createOrder: new CreateOrder(orderRepository),
  getOrders: new GetOrders(orderRepository),
  updateOrderStatus: new UpdateOrderStatus(orderRepository),
};
