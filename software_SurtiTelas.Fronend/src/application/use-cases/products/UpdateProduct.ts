import type { Product, ProductData } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export class UpdateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(ref: string, changes: Partial<ProductData>): Promise<Product> {
    return this.productRepository.update(ref, changes);
  }
}
