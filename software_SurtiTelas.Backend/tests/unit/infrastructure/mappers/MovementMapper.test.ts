import { describe, it, expect } from 'vitest';
import { toInventoryMovementData } from '@/modules/stock/infrastructure/mappers/MovementMapper';

const row = {
  id: 'mov-1',
  tipo: 'ENTRADA',
  productId: 'p-1',
  rawMaterialId: 'rm-1',
  cantidad: 10,
  ajuste: 2,
  motivo: 'Reabastecimiento',
  usuarioId: 'user-1',
  fecha: new Date('2026-01-01T00:00:00.000Z'),
};

describe('MovementMapper.toInventoryMovementData', () => {
  it('maps a DB row into InventoryMovementData', () => {
    const data = toInventoryMovementData(row);
    expect(data).toMatchObject({
      id: 'mov-1',
      tipo: 'ENTRADA',
      productId: 'p-1',
      rawMaterialId: 'rm-1',
      cantidad: 10,
      ajuste: 2,
      motivo: 'Reabastecimiento',
      usuarioId: 'user-1',
      fecha: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('returns undefined for nullable fields', () => {
    const data = toInventoryMovementData({
      ...row,
      productId: null,
      rawMaterialId: null,
      ajuste: null,
    });
    expect(data.productId).toBeUndefined();
    expect(data.rawMaterialId).toBeUndefined();
    expect(data.ajuste).toBeUndefined();
  });
});
