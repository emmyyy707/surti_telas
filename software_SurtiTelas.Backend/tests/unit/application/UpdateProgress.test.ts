import { describe, it, expect, vi } from 'vitest';
import { UpdateProgress } from '@/modules/production/application/use-cases/ProductionUseCases';
import type { ProductionOrderRepository } from '@/modules/production/domain/repositories/ProductionOrderRepository';

describe('UpdateProgress', () => {
  it('should update progress and estado to EN_PROCESO when avance > 0', async () => {
    const order = {
      id: '1',
      avance: 0,
      estado: 'PENDIENTE',
      avanceValido: vi.fn().mockReturnValue(true),
    };

    const updated = {
      ...order,
      avance: 50,
      estado: 'EN_PROCESO',
    };

    const repo: jest.Mocked<ProductionOrderRepository> = {
      updateProgress: vi.fn().mockResolvedValue(updated as any),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      assignToWorkshop: vi.fn(),
      complete: vi.fn(),
    };

    const useCase = new UpdateProgress(repo);
    const result = await useCase.execute('1', 50);

    expect(result.avance).toBe(50);
    expect(result.estado).toBe('EN_PROCESO');
    expect(repo.updateProgress).toHaveBeenCalledWith('1', 50);
  });

  it('should throw error for invalid avance', async () => {
    const repo: jest.Mocked<ProductionOrderRepository> = {
      updateProgress: vi.fn().mockRejectedValue(new Error('El avance debe estar entre 0 y 100')),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      assignToWorkshop: vi.fn(),
      complete: vi.fn(),
    };

    const useCase = new UpdateProgress(repo);
    await expect(useCase.execute('1', 150)).rejects.toThrow();
  });
});
