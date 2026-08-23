import { prisma } from '../../../../config/database';
import { PrismaPurchaseRepository } from '../repositories/PrismaPurchaseRepository';
import {
  AddPurchaseItem,
  CancelPurchase,
  CreatePurchase,
  DeletePurchase,
  GetPurchaseById,
  GetPurchaseItems,
  GetPurchases,
  RemovePurchaseItem,
  UpdatePurchase,
} from '../../application/use-cases/PurchaseUseCases';

const repository = new PrismaPurchaseRepository(prisma);

export const purchaseUseCases = {
  createPurchase: new CreatePurchase(repository),
  getPurchases: new GetPurchases(repository),
  getPurchaseById: new GetPurchaseById(repository),
  updatePurchase: new UpdatePurchase(repository),
  cancelPurchase: new CancelPurchase(repository),
  deletePurchase: new DeletePurchase(repository),
  getPurchaseItems: new GetPurchaseItems(repository),
  addPurchaseItem: new AddPurchaseItem(repository),
  removePurchaseItem: new RemovePurchaseItem(repository),
};
