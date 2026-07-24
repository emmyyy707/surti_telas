import { describe, it, expect, vi } from 'vitest';
import { RegisterMovement } from '@/modules/stock/application/use-cases/StockUseCases';
import type { RawMaterialRepository } from '@/modules/stock/domain/repositories/RawMaterialRepository';
import type { InventoryMovementRepository } from '@/modules/stock/domain/repositories/InventoryMovementRepository';

describe('RegisterMovement', () => {
  it('should register an entrada movement and update stock', async () => {
    const rawRepo: jest.Mocked<RawMaterialRepository> = {
      getById: vi.fn().mockResolvedValue({
        id: '1',
        nombre: 'Algodón',
        stockActual: 100,
        stockMinimo: 20,
        precioUnitario: 5000,
        necesitaReposicion: () => false,
      } as any),
      update: vi.fn().mockResolvedValue({
        id: '1',
        nombre: 'Algodón',
        stockActual: 150,
        stockMinimo: 20,
        precioUnitario: 5000,
        necesitaReposicion: () => false,
      } as any),
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const movementRepo: jest.Mocked<InventoryMovementRepository> = {
      create: vi.fn().mockResolvedValue({
        id: '1',
        tipo: 'ENTRADA',
        cantidad: 50,
        motivo: 'Compra',
        usuarioId: 'user1',
        fecha: new Date(),
      } as any),
      list: vi.fn(),
    };

    const useCase = new RegisterMovement(rawRepo, movementRepo);
    const result = await useCase.execute({
      rawMaterialId: '1',
      tipo: 'ENTRADA',
      cantidad: 50,
      motivo: 'Compra',
      usuarioId: 'user1',
    });

    expect(result.stockActual).toBe(150);
    expect(rawRepo.update).toHaveBeenCalledWith('1', { stockActual: 150 });
    expect(movementRepo.create).toHaveBeenCalled();
  });

  it('should register a salida movement', async () => {
    const rawRepo: jest.Mocked<RawMaterialRepository> = {
      getById: vi.fn().mockResolvedValue({
        id: '1',
        nombre: 'Algodón',
        stockActual: 100,
        stockMinimo: 20,
        precioUnitario: 5000,
        necesitaReposicion: () => false,
      } as any),
      update: vi.fn().mockResolvedValue({
        id: '1',
        nombre: 'Algodón',
        stockActual: 50,
        stockMinimo: 20,
        precioUnitario: 5000,
        necesitaReposicion: () => false,
      } as any),
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const movementRepo: jest.Mocked<InventoryMovementRepository> = {
      create: vi.fn().mockResolvedValue({
        id: '1',
        tipo: 'SALIDA',
        cantidad: 50,
        motivo: 'Uso',
        usuarioId: 'user1',
        fecha: new Date(),
      } as any),
      list: vi.fn(),
    };

    const useCase = new RegisterMovement(rawRepo, movementRepo);
    const result = await useCase.execute({
      rawMaterialId: '1',
      tipo: 'SALIDA',
      cantidad: 50,
      motivo: 'Uso',
      usuarioId: 'user1',
    });

    expect(result.stockActual).toBe(50);
  });
});
