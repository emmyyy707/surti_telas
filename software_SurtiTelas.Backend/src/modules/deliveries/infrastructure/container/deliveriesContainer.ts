import { PrismaClient } from '@prisma/client';
import { PrismaDeliveryRepository } from '../repositories/PrismaDeliveryRepository';
import { PrismaOrderRepository } from '../../../orders/infrastructure/repositories/PrismaOrderRepository';
import {
  ChangeDeliveryStatus,
  CreateDelivery,
  DeleteDelivery,
  GetDelivery,
  ListDeliveries,
  ListRutaDelDia,
  UpdateDelivery,
} from '../../application/use-cases/DeliveryUseCases';

const prisma = new PrismaClient();

const deliveryRepository = new PrismaDeliveryRepository(prisma);
const orderRepository = new PrismaOrderRepository(prisma);

export const deliveriesUseCases = {
  listDeliveries: new ListDeliveries(deliveryRepository),
  getDelivery: new GetDelivery(deliveryRepository),
  createDelivery: new CreateDelivery(deliveryRepository),
  updateDelivery: new UpdateDelivery(deliveryRepository),
  changeDeliveryStatus: new ChangeDeliveryStatus(deliveryRepository, orderRepository),
  deleteDelivery: new DeleteDelivery(deliveryRepository),
  listRutaDelDia: new ListRutaDelDia(prisma),
};
