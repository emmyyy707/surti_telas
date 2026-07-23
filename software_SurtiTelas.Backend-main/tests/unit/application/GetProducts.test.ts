import { describe, it, expect, vi } from 'vitest';
import { GetProducts } from '@/modules/catalog/application/use-cases/ProductUseCases';
import type { ProductRepository } from '@/modules/catalog/domain/repositories/ProductRepository';

describe('GetProducts', () => {
  it('should return paginated products', async () => {
    const products = [
      {
        id: '1',
        ref: 'REF-001',
        nombre: 'Camiseta',
        precio: 25000,
        cantidadStock: 100,
        publicado: true,
        stock: 'OK',
        categoria: { id: '1', nombre: 'Camisetas', slug: 'camisetas' },
      },
    ];

    const repo: jest.Mocked<ProductRepository> = {
      list: vi.fn().mockResolvedValue({
        data: products as any,
        meta: { total: 1, page: 1, limit: 50 },
      }),
      getById: vi.fn(),
      getByRef: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetProducts(repo);
    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].nombre).toBe('Camiseta');
    expect(result.meta.total).toBe(1);
  });
});
