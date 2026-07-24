import { describe, it, expect, vi } from 'vitest';
import { UpdateOrderStatus } from '@/modules/orders/application/use-cases/OrderUseCases';
import type { OrderRepository } from '@/modules/orders/domain/repositories/OrderRepository';

describe('UpdateOrderStatus', () => {
  it('should update order status with valid transition', async () => {
    const order = {
      id: '1',
      estado: 'Nuevo',
      canTransitionTo: vi.fn().mockReturnValue(true),
    };

    const updated = {
      ...order,
      estado: 'En producción',
    };

    const repo: jest.Mocked<OrderRepository> = {
      getById: vi.fn().mockResolvedValue(order as any),
      updateStatus: vi.fn().mockResolvedValue(updated as any),
      list: vi.fn(),
      create: vi.fn(),
      assignDomiciliario: vi.fn(),
    };

    const useCase = new UpdateOrderStatus(repo);
    const result = await useCase.execute('1', 'En producción');

    expect(result.estado).toBe('En producción');
    expect(repo.updateStatus).toHaveBeenCalledWith('1', 'En producción');
  });

  it('should throw error for invalid transition', async () => {
    const repo: jest.Mocked<OrderRepository> = {
      getById: vi.fn().mockResolvedValue({
        id: '1',
        estado: 'Nuevo',
        canTransitionTo: vi.fn().mockReturnValue(false),
      } as any),
      updateStatus: vi.fn().mockRejectedValue(new Error('Transición no permitida')),
      list: vi.fn(),
      create: vi.fn(),
      assignDomiciliario: vi.fn(),
    };

    const useCase = new UpdateOrderStatus(repo);
    await expect(useCase.execute('1', 'Entregado')).rejects.toThrow();
  });
});
