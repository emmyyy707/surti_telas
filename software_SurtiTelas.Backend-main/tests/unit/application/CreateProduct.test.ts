import { describe, it, expect, vi } from 'vitest';
import { CreateProduct } from '@/modules/catalog/application/use-cases/ProductUseCases';
import type { ProductRepository } from '@/modules/catalog/domain/repositories/ProductRepository';

describe('CreateProduct', () => {
  it('should create a product', async () => {
    const product = {
      id: '1',
      ref: 'REF-001',
      nombre: 'Camiseta',
      precio: 25000,
      cantidadStock: 100,
      publicado: false,
      stock: 'OK',
      categoria: { id: '1', nombre: 'Camisetas', slug: 'camisetas' },
    };

    const repo: jest.Mocked<ProductRepository> = {
      create: vi.fn().mockResolvedValue(product as any),
      list: vi.fn(),
      getById: vi.fn(),
      getByRef: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateProduct(repo);
    const result = await useCase.execute({
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

    expect(result.nombre).toBe('Camiseta');
    expect(repo.create).toHaveBeenCalled();
  });
});
