import { describe, it, expect, vi } from 'vitest';
import { AssignToWorkshop } from '@/modules/production/application/use-cases/ProductionUseCases';
import type { ProductionOrderRepository } from '@/modules/production/domain/repositories/ProductionOrderRepository';

describe('AssignToWorkshop', () => {
  it('should assign production order to workshop', async () => {
    const order = {
      id: '1',
      tallerId: null,
    };

    const updated = {
      ...order,
      tallerId: 'taller1',
    };

    const repo: jest.Mocked<ProductionOrderRepository> = {
      assignToWorkshop: vi.fn().mockResolvedValue(updated as any),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateProgress: vi.fn(),
      complete: vi.fn(),
    };

    const useCase = new AssignToWorkshop(repo);
    const result = await useCase.execute('1', 'taller1');

    expect(result.tallerId).toBe('taller1');
    expect(repo.assignToWorkshop).toHaveBeenCalledWith('1', 'taller1');
  });
});
