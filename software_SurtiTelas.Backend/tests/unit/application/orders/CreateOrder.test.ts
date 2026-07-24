import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrder } from '@/modules/orders/application/use-cases/OrderUseCases';
import { NotFoundError } from '@/shared/domain/errors';

const mockRepo = {
  create: vi.fn(),
};

const mockCustomerRepo = {
  getById: vi.fn(),
};

const mockProductRepo = {
  getById: vi.fn(),
};

const mockEventBus = {
  publish: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateOrder', () => {
  const mockPrisma = {
    $transaction: vi.fn(),
  };

  it('should create order and reduce stock', async () => {
    const orderResult = {
      id: 'order-1',
      numero: 'PED-000001',
      cliente: 'cli1',
      asesor: 'asesor1',
      total: 50000,
      items: 2,
      estado: 'Nuevo',
      itemsList: [
        { productId: 'prod1', nombre: 'Camiseta', precio: 25000, cantidad: 2 },
      ],
    };

    mockPrisma.$transaction.mockResolvedValue(orderResult);

    const useCase = new CreateOrder(
      mockRepo as any,
      mockCustomerRepo as any,
      mockProductRepo as any,
      mockPrisma as any,
      mockEventBus as any,
    );

    mockCustomerRepo.getById.mockResolvedValue({
      id: 'cli1',
      nombre: 'Juan',
      tieneCupoDisponible: () => true,
    });

    mockProductRepo.getById.mockResolvedValue({
      id: 'prod1',
      ref: 'REF-001',
      cantidadStock: 10,
    });

    mockRepo.create.mockResolvedValue(orderResult);

    const result = await useCase.execute({
      clienteId: 'cli1',
      asesorId: 'asesor1',
      itemsList: [
        { productId: 'prod1', nombre: 'Camiseta', precio: 25000, cantidad: 2 },
      ],
    });

    expect(result.id).toBe('order-1');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw NotFoundError when customer does not exist', async () => {
    const useCase = new CreateOrder(
      mockRepo as any,
      mockCustomerRepo as any,
      mockProductRepo as any,
      mockPrisma as any,
      mockEventBus as any,
    );

    mockCustomerRepo.getById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        clienteId: 'cli1',
        asesorId: 'asesor1',
        itemsList: [{ nombre: 'Camiseta', precio: 25000, cantidad: 2 }],
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw error when customer has insufficient credit', async () => {
    const useCase = new CreateOrder(
      mockRepo as any,
      mockCustomerRepo as any,
      mockProductRepo as any,
      mockPrisma as any,
      mockEventBus as any,
    );

    mockCustomerRepo.getById.mockResolvedValue({
      id: 'cli1',
      nombre: 'Juan',
      tieneCupoDisponible: () => false,
    });

    await expect(
      useCase.execute({
        clienteId: 'cli1',
        asesorId: 'asesor1',
        itemsList: [{ nombre: 'Camiseta', precio: 25000, cantidad: 2 }],
      }),
    ).rejects.toThrow('cupo');
  });
});
