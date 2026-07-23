import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaWorkshopRepository } from '../repositories/PrismaWorkshopRepository';
import { PrismaProductionOrderRepository } from '../repositories/PrismaProductionOrderRepository';
import { PrismaControlPrendaRepository } from '../repositories/PrismaControlPrendaRepository';
import {
  AssignToWorkshop,
  CompleteProduction,
  CreateProductionOrder,
  DeleteProductionOrder,
  DeleteWorkshop,
  GetProductionAlerts,
  GetProductionOrders,
  GetWorkshops,
  RegisterWorkshop,
  UpdateProgress,
  UpdateProductionOrder,
  UpdateWorkshop,
  CreateControlPrenda,
  ReviewControlPrenda,
  ListControlPrendas,
  UpdateControlPrenda,
  DeleteControlPrenda,
} from '../../application/use-cases/ProductionUseCases';

const workshopRepository = new PrismaWorkshopRepository(prisma);
const productionOrderRepository = new PrismaProductionOrderRepository(prisma);
const controlPrendaRepository = new PrismaControlPrendaRepository(prisma);

export const productionUseCases = {
  registerWorkshop: new RegisterWorkshop(workshopRepository),
  updateWorkshop: new UpdateWorkshop(workshopRepository),
  deleteWorkshop: new DeleteWorkshop(workshopRepository),
  getWorkshops: new GetWorkshops(workshopRepository),
  createProductionOrder: new CreateProductionOrder(productionOrderRepository),
  assignToWorkshop: new AssignToWorkshop(productionOrderRepository),
  updateProgress: new UpdateProgress(productionOrderRepository),
  updateProductionOrder: new UpdateProductionOrder(productionOrderRepository),
  deleteProductionOrder: new DeleteProductionOrder(productionOrderRepository),
  completeProduction: new CompleteProduction(productionOrderRepository, eventBus),
  getProductionOrders: new GetProductionOrders(productionOrderRepository),
  getProductionAlerts: new GetProductionAlerts(productionOrderRepository),
  createControlPrenda: new CreateControlPrenda(controlPrendaRepository),
  reviewControlPrenda: new ReviewControlPrenda(controlPrendaRepository),
  listControlPrendas: new ListControlPrendas(controlPrendaRepository),
  updateControlPrenda: new UpdateControlPrenda(controlPrendaRepository),
  deleteControlPrenda: new DeleteControlPrenda(controlPrendaRepository),
};
