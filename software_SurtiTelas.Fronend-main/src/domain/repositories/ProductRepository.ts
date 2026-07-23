import type { Product, ProductData } from '@/domain/entities/Product';

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getByRef(ref: string): Promise<Product | null>;
  create(input: Omit<ProductData, 'ref'> & { ref?: string }): Promise<Product>;
  update(ref: string, changes: Partial<ProductData>): Promise<Product>;
  delete(ref: string): Promise<void>;
}
