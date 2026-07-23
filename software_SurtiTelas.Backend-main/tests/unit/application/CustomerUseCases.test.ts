import { describe, it, expect, vi } from 'vitest';
import { CreateCustomer } from '@/modules/customers/application/use-cases/CustomerUseCases';
import type { CustomerRepository } from '@/modules/customers/domain/repositories/CustomerRepository';

describe('CreateCustomer', () => {
  it('should create a customer through repository', async () => {
    const mockCustomer = {
      id: '1',
      nombre: 'Juan Pérez',
      cupoTotal: 1000000,
      cupoUsado: 0,
      deudaVencida: 0,
      isTrustedCustomer: false,
      estado: 'ACTIVO',
      pedidos: 0,
    };

    const repo: jest.Mocked<CustomerRepository> = {
      create: vi.fn().mockResolvedValue(mockCustomer as any),
      list: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      assignAsesor: vi.fn(),
      updateCupo: vi.fn(),
    };

    const useCase = new CreateCustomer(repo);
    const result = await useCase.execute({
      nombre: 'Juan Pérez',
      cupoTotal: 1000000,
    });

    expect(result.nombre).toBe('Juan Pérez');
    expect(repo.create).toHaveBeenCalledWith({
      nombre: 'Juan Pérez',
      cupoTotal: 1000000,
    });
  });
});
