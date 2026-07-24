import { prisma } from '../../../../config/database';
import { PrismaCategoryRepository } from '../repositories/PrismaCategoryRepository';
import { PrismaProductRepository } from '../repositories/PrismaProductRepository';
import {
  CreateProduct,
  DeleteProduct,
  GetProductByRef,
  GetProducts,
  PublishProduct,
  UnpublishProduct,
  UpdateProduct,
} from '../../application/use-cases/ProductUseCases';
import { CreateCategory, GetCategories } from '../../application/use-cases/CategoryUseCases';

const productRepository = new PrismaProductRepository(prisma);
const categoryRepository = new PrismaCategoryRepository(prisma);

export const catalogUseCases = {
  createProduct: new CreateProduct(productRepository),
  getProducts: new GetProducts(productRepository),
  getProductByRef: new GetProductByRef(productRepository),
  updateProduct: new UpdateProduct(productRepository),
  deleteProduct: new DeleteProduct(productRepository),
  publishProduct: new PublishProduct(productRepository),
  unpublishProduct: new UnpublishProduct(productRepository),
  createCategory: new CreateCategory(categoryRepository),
  getCategories: new GetCategories(categoryRepository),
};
