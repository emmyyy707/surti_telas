import type { Product } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export class CreateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: Parameters<ProductRepository['create']>[0]): Promise<Product> {
    return this.productRepository.create(input);
  }
}
