import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaSupplierRepository } from '../repositories/PrismaSupplierRepository';
import { PrismaRawMaterialRepository } from '../repositories/PrismaRawMaterialRepository';
import { PrismaInventoryMovementRepository } from '../repositories/PrismaInventoryMovementRepository';
import {
  CreateRawMaterial,
  CreateSupplier,
  DeleteRawMaterial,
  DeleteSupplier,
  GetRawMaterials,
  GetMovements,
  GetStockAlerts,
  GetSuppliers,
  GetSupplierById,
  RegisterMovement,
  UpdateRawMaterial,
  UpdateSupplier,
} from '../../application/use-cases/StockUseCases';

const supplierRepository = new PrismaSupplierRepository(prisma);
const rawMaterialRepository = new PrismaRawMaterialRepository(prisma);
const movementRepository = new PrismaInventoryMovementRepository(prisma);

export const stockUseCases = {
  createSupplier: new CreateSupplier(supplierRepository),
  getSuppliers: new GetSuppliers(supplierRepository),
  getSupplierById: new GetSupplierById(supplierRepository),
  updateSupplier: new UpdateSupplier(supplierRepository),
  deleteSupplier: new DeleteSupplier(supplierRepository),
  createRawMaterial: new CreateRawMaterial(rawMaterialRepository),
  getRawMaterials: new GetRawMaterials(rawMaterialRepository),
  updateRawMaterial: new UpdateRawMaterial(rawMaterialRepository),
  deleteRawMaterial: new DeleteRawMaterial(rawMaterialRepository),
  registerMovement: new RegisterMovement(rawMaterialRepository, movementRepository, eventBus),
  getMovements: new GetMovements(movementRepository),
  getStockAlerts: new GetStockAlerts(rawMaterialRepository),
};
