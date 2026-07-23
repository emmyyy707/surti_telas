import { describe, it, expect, vi } from 'vitest';
import { CompleteProduction } from '@/modules/production/application/use-cases/ProductionUseCases';
import type { ProductionOrderRepository } from '@/modules/production/domain/repositories/ProductionOrderRepository';

describe('CompleteProduction', () => {
  it('should complete production when avance is 100', async () => {
    const order = {
      id: '1',
      referencia: 'REF-001',
      cantidad: 100,
      avance: 100,
      estado: 'TERMINADO',
      tallerId: 'taller1',
    };

    const repo: jest.Mocked<ProductionOrderRepository> = {
      complete: vi.fn().mockResolvedValue(order as any),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      assignToWorkshop: vi.fn(),
      updateProgress: vi.fn(),
    };

    const useCase = new CompleteProduction(repo);
    const result = await useCase.execute('1');

    expect(result.estado).toBe('TERMINADO');
    expect(repo.complete).toHaveBeenCalledWith('1');
  });

  it('should publish ProductionCompletedEvent', async () => {
    const order = {
      id: '1',
      referencia: 'REF-001',
      cantidad: 100,
      avance: 100,
      estado: 'TERMINADO',
      tallerId: 'taller1',
    };

    const repo: jest.Mocked<ProductionOrderRepository> = {
      complete: vi.fn().mockResolvedValue(order as any),
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      assignToWorkshop: vi.fn(),
      updateProgress: vi.fn(),
    };

    const eventBus = {
      publish: vi.fn(),
    };

    const useCase = new CompleteProduction(repo, eventBus as any);
    await useCase.execute('1');

    expect(eventBus.publish).toHaveBeenCalled();
  });
});
