import { Product, type ProductData } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import { ProductMapper } from '@/infrastructure/mappers/ProductMapper';
import { catalogApi } from '@/infrastructure/api/catalogApi';
import type { Producto } from '@/core/types';

/**
 * Implementación HTTP del ProductRepository (reemplaza LocalStorageProductRepository).
 * Consume el backend real /catalog/products.
 */
export class ApiProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const result = await catalogApi.list();
    return result.data.map((p) => ProductMapper.toDomain(p as ProductData));
  }

  async getById(id: string): Promise<Product | null> {
    const result = await catalogApi.list();
    const found = result.data.find((p) => p.id === id);
    return found ? ProductMapper.toDomain(found as ProductData) : null;
  }

  async getByRef(ref: string): Promise<Product | null> {
    const found = await catalogApi.getByRef(ref);
    return found ? ProductMapper.toDomain(found as ProductData) : null;
  }

  async create(input: Omit<ProductData, 'ref'> & { ref?: string }): Promise<Product> {
    const producto = await catalogApi.create(input as Partial<Producto>);
    return ProductMapper.toDomain(producto as ProductData);
  }

  async update(ref: string, changes: Partial<ProductData>): Promise<Product> {
    const producto = await catalogApi.update(ref, changes as Partial<Producto>);
    return ProductMapper.toDomain(producto as ProductData);
  }

  async delete(ref: string): Promise<void> {
    await catalogApi.remove(ref);
  }
}
