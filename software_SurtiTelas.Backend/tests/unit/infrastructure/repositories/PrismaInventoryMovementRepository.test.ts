import { describe, it, expect, vi } from 'vitest';
import { PrismaInventoryMovementRepository } from '@/modules/stock/infrastructure/repositories/PrismaInventoryMovementRepository';

const mockPrisma = {
  inventoryMovement: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaInventoryMovementRepository(mockPrisma as any);

describe('PrismaInventoryMovementRepository', () => {
  it('should list movements', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [{ id: '1', tipo: 'ENTRADA', productId: 'prod1', rawMaterialId: null, cantidad: 100, ajuste: null, motivo: 'Compra', usuarioId: 'user1', fecha: new Date() }],
      1,
    ]);

    const result = await repo.list({ tipo: 'ENTRADA', page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].tipo).toBe('ENTRADA');
  });

  it('should create movement', async () => {
    mockPrisma.inventoryMovement.create.mockResolvedValue({
      id: '1',
      tipo: 'ENTRADA',
      productId: 'prod1',
      rawMaterialId: null,
      cantidad: 100,
      ajuste: null,
      motivo: 'Compra',
      usuarioId: 'user1',
      fecha: new Date(),
    });

    const result = await repo.create({
      tipo: 'ENTRADA',
      productId: 'prod1',
      cantidad: 100,
      motivo: 'Compra',
      usuarioId: 'user1',
    });

    expect(result.tipo).toBe('ENTRADA');
    expect(result.cantidad).toBe(100);
  });
});
