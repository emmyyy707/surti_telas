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
  registerWorkshop: new RegisterWorkshop(workshopRepository, eventBus),
  updateWorkshop: new UpdateWorkshop(workshopRepository, eventBus),
  deleteWorkshop: new DeleteWorkshop(workshopRepository, eventBus),
  getWorkshops: new GetWorkshops(workshopRepository),
  createProductionOrder: new CreateProductionOrder(productionOrderRepository, eventBus),
  assignToWorkshop: new AssignToWorkshop(productionOrderRepository, eventBus),
  updateProgress: new UpdateProgress(productionOrderRepository, eventBus),
  updateProductionOrder: new UpdateProductionOrder(productionOrderRepository, eventBus),
  deleteProductionOrder: new DeleteProductionOrder(productionOrderRepository, eventBus),
  completeProduction: new CompleteProduction(productionOrderRepository, eventBus),
  getProductionOrders: new GetProductionOrders(productionOrderRepository),
  getProductionAlerts: new GetProductionAlerts(productionOrderRepository),
  createControlPrenda: new CreateControlPrenda(controlPrendaRepository, eventBus),
  reviewControlPrenda: new ReviewControlPrenda(controlPrendaRepository, eventBus),
  listControlPrendas: new ListControlPrendas(controlPrendaRepository),
  updateControlPrenda: new UpdateControlPrenda(controlPrendaRepository, eventBus),
  deleteControlPrenda: new DeleteControlPrenda(controlPrendaRepository, eventBus),
};
