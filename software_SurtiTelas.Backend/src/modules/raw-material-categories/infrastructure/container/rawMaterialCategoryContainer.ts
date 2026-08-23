import { prisma } from '../../../../config/database';
import { PrismaRawMaterialCategoryRepository } from '../repositories/PrismaRawMaterialCategoryRepository';
import {
  CreateRawMaterialCategory,
  DeleteRawMaterialCategory,
  GetRawMaterialCategories,
  GetRawMaterialCategoryById,
  UpdateRawMaterialCategory,
} from '../../application/use-cases/RawMaterialCategoryUseCases';

const repository = new PrismaRawMaterialCategoryRepository(prisma);

export const rawMaterialCategoryUseCases = {
  createCategory: new CreateRawMaterialCategory(repository),
  getCategories: new GetRawMaterialCategories(repository),
  getCategoryById: new GetRawMaterialCategoryById(repository),
  updateCategory: new UpdateRawMaterialCategory(repository),
  deleteCategory: new DeleteRawMaterialCategory(repository),
};
