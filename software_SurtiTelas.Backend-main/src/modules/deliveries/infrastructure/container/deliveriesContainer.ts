import { PrismaClient } from '@prisma/client';
import { PrismaDeliveryRepository } from '../repositories/PrismaDeliveryRepository';
import {
  ChangeDeliveryStatus,
  CreateDelivery,
  DeleteDelivery,
  GetDelivery,
  ListDeliveries,
  UpdateDelivery,
} from '../../application/use-cases/DeliveryUseCases';

const prisma = new PrismaClient();

const deliveryRepository = new PrismaDeliveryRepository(prisma);

export const deliveriesUseCases = {
  listDeliveries: new ListDeliveries(deliveryRepository),
  getDelivery: new GetDelivery(deliveryRepository),
  createDelivery: new CreateDelivery(deliveryRepository),
  updateDelivery: new UpdateDelivery(deliveryRepository),
  changeDeliveryStatus: new ChangeDeliveryStatus(deliveryRepository),
  deleteDelivery: new DeleteDelivery(deliveryRepository),
};
