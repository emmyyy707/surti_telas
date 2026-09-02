import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaWorkshopRepository } from '../repositories/PrismaWorkshopRepository';
import { PrismaProductionOrderRepository } from '../repositories/PrismaProductionOrderRepository';
import { PrismaControlPrendaRepository } from '../repositories/PrismaControlPrendaRepository';
import { PrismaProductionItemRepository } from '../repositories/PrismaProductionItemRepository';
import {
  AssignToWorkshop,
  CompleteProduction,
  CreateProductionOrder,
  DeleteProductionOrder,
  DeleteWorkshop,
  GetProductionAlerts,
  GetProductionOrderById,
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
import {
  CreateProductionItem,
  UpdateProductionItem,
  DeleteProductionItem,
  GetProductionItems,
  GetProductionItemById,
} from '../../application/use-cases/ProductionItemUseCases';

const workshopRepository = new PrismaWorkshopRepository(prisma);
const productionOrderRepository = new PrismaProductionOrderRepository(prisma);
const controlPrendaRepository = new PrismaControlPrendaRepository(prisma);
const productionItemRepository = new PrismaProductionItemRepository(prisma);

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
  getProductionOrderById: new GetProductionOrderById(productionOrderRepository),
  getProductionAlerts: new GetProductionAlerts(productionOrderRepository),
  createControlPrenda: new CreateControlPrenda(controlPrendaRepository, eventBus),
  reviewControlPrenda: new ReviewControlPrenda(controlPrendaRepository, eventBus),
  listControlPrendas: new ListControlPrendas(controlPrendaRepository),
  updateControlPrenda: new UpdateControlPrenda(controlPrendaRepository, eventBus),
  deleteControlPrenda: new DeleteControlPrenda(controlPrendaRepository, eventBus),
  createProductionItem: new CreateProductionItem(productionItemRepository),
  updateProductionItem: new UpdateProductionItem(productionItemRepository),
  deleteProductionItem: new DeleteProductionItem(productionItemRepository),
  getProductionItems: new GetProductionItems(productionItemRepository),
  getProductionItemById: new GetProductionItemById(productionItemRepository),
};
