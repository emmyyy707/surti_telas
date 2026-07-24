import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '../../../customers/infrastructure/repositories/PrismaCustomerRepository';
import { PrismaProductRepository } from '../../../catalog/infrastructure/repositories/PrismaProductRepository';
import {
  AssignDomiciliario,
  CreateOrder,
  DeleteOrder,
  GetOrderById,
  GetOrders,
  UpdateOrderFull,
  UpdateOrderStatus,
} from '../../application/use-cases/OrderUseCases';
import { GetDashboardMetrics } from '../../application/use-cases/DashboardMetrics';

const orderRepository = new PrismaOrderRepository(prisma);
const customerRepository = new PrismaCustomerRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);

export const orderUseCases = {
  createOrder: new CreateOrder(orderRepository, customerRepository, productRepository, prisma, eventBus),
  getOrders: new GetOrders(orderRepository),
  getOrderById: new GetOrderById(orderRepository),
  updateOrderStatus: new UpdateOrderStatus(orderRepository, eventBus),
  updateOrderFull: new UpdateOrderFull(orderRepository),
  deleteOrder: new DeleteOrder(orderRepository),
  assignDomiciliario: new AssignDomiciliario(orderRepository),
  getDashboardMetrics: new GetDashboardMetrics(prisma),
};

export { eventBus };
