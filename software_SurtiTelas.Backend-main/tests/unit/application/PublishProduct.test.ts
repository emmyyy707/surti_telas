import { describe, it, expect, vi } from 'vitest';
import { PublishProduct } from '@/modules/catalog/application/use-cases/ProductUseCases';
import type { ProductRepository } from '@/modules/catalog/domain/repositories/ProductRepository';
import { Product } from '@/modules/catalog/domain/entities/Product';

describe('PublishProduct', () => {
  it('should publish a product', async () => {
    const unpublished = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta',
      categoria: 'Camisetas',
      precio: 25000,
      cantidadStock: 100,
      stock: 'OK',
      publicado: false,
      tela: 'Algodón',
      colores: ['Rojo'],
      tallas: ['M'],
      imagenes: [],
    });

    const published = unpublished.publish();

    const repo: jest.Mocked<ProductRepository> = {
      getByRef: vi.fn().mockResolvedValue(unpublished),
      update: vi.fn().mockResolvedValue(published),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new PublishProduct(repo);
    const result = await useCase.execute('REF-001');

    expect(result.publicado).toBe(true);
    expect(repo.update).toHaveBeenCalledWith('REF-001', expect.objectContaining({ publicado: true }));
  });

  it('should throw error if product not found', async () => {
    const repo: jest.Mocked<ProductRepository> = {
      getByRef: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new PublishProduct(repo);
    await expect(useCase.execute('REF-999')).rejects.toThrow('Producto no encontrado');
  });
});
