import { CreateProduct } from '@/application/use-cases/products/CreateProduct';
import { GetProducts } from '@/application/use-cases/products/GetProducts';
import { UpdateProduct } from '@/application/use-cases/products/UpdateProduct';
import { ApiProductRepository } from '@/infrastructure/repositories/ApiProductRepository';

const productRepository = new ApiProductRepository();

export const productUseCases = {
  getProducts: new GetProducts(productRepository),
  createProduct: new CreateProduct(productRepository),
  updateProduct: new UpdateProduct(productRepository),
};
