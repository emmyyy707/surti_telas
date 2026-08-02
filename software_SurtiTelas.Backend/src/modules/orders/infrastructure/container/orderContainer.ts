import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '../../../customers/infrastructure/repositories/PrismaCustomerRepository';
import { PrismaProductRepository } from '../../../catalog/infrastructure/repositories/PrismaProductRepository';
import {
  ApproveOrder,
  AssignDomiciliario,
  CancelOrder,
  CreateOrder,
  DeleteOrder,
  GetOrderById,
  GetOrders,
  RejectOrder,
  UpdateOrderFull,
  UpdateOrderStatus,
  UploadPaymentProof,
} from '../../application/use-cases/OrderUseCases';
import { GetDashboardMetrics } from '../../application/use-cases/DashboardMetrics';

const orderRepository = new PrismaOrderRepository(prisma);
const customerRepository = new PrismaCustomerRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);

export const orderUseCases = {
  createOrder: new CreateOrder(orderRepository, customerRepository, productRepository, prisma, eventBus),
  getOrders: new GetOrders(orderRepository),
  getOrderById: new GetOrderById(orderRepository),
  updateOrderStatus: new UpdateOrderStatus(orderRepository, eventBus, prisma),
  updateOrderFull: new UpdateOrderFull(orderRepository),
  deleteOrder: new DeleteOrder(orderRepository),
  assignDomiciliario: new AssignDomiciliario(orderRepository),
  approveOrder: new ApproveOrder(orderRepository, eventBus),
  rejectOrder: new RejectOrder(orderRepository, eventBus),
  uploadPaymentProof: new UploadPaymentProof(orderRepository, eventBus),
  cancelOrder: new CancelOrder(orderRepository, eventBus),
  getDashboardMetrics: new GetDashboardMetrics(prisma),
};

export { eventBus };
