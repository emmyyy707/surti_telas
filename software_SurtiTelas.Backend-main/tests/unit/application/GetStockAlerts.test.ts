import { describe, it, expect, vi } from 'vitest';
import { GetStockAlerts } from '@/modules/stock/application/use-cases/StockUseCases';
import type { RawMaterialRepository } from '@/modules/stock/domain/repositories/RawMaterialRepository';

describe('GetStockAlerts', () => {
  it('should return raw materials that need restock', async () => {
    const materials = [
      {
        id: '1',
        nombre: 'Algodón',
        stockActual: 10,
        stockMinimo: 20,
        precioUnitario: 5000,
        necesitaReposicion: () => true,
      },
    ];

    const repo: jest.Mocked<RawMaterialRepository> = {
      list: vi.fn().mockResolvedValue({
        data: materials as any,
        meta: { total: 1, page: 1, limit: 50 },
      }),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetStockAlerts(repo);
    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].stockActual).toBeLessThanOrEqual(result.data[0].stockMinimo);
  });
});
