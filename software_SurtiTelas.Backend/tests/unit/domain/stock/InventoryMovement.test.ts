import { describe, it, expect } from 'vitest';
import { InventoryMovement } from '@/modules/stock/domain/entities/InventoryMovement';

describe('InventoryMovement', () => {
  it('should create a valid entrada movement with productId', () => {
    const movement = new InventoryMovement({
      tipo: 'ENTRADA',
      productId: 'prod1',
      cantidad: 100,
      motivo: 'Compra',
      usuarioId: 'user1',
    });
    expect(movement.tipo).toBe('ENTRADA');
    expect(movement.cantidad).toBe(100);
    expect(movement.motivo).toBe('Compra');
    expect(movement.productId).toBe('prod1');
  });

  it('should create a valid salida movement with rawMaterialId', () => {
    const movement = new InventoryMovement({
      tipo: 'SALIDA',
      rawMaterialId: 'mat1',
      cantidad: 50,
      motivo: 'Uso en producción',
      usuarioId: 'user1',
    });
    expect(movement.tipo).toBe('SALIDA');
    expect(movement.cantidad).toBe(50);
    expect(movement.rawMaterialId).toBe('mat1');
  });

  it('should create movement with ajuste', () => {
    const movement = new InventoryMovement({
      tipo: 'AJUSTE',
      productId: 'prod1',
      cantidad: 100,
      ajuste: 10,
      motivo: 'Ajuste de inventario',
      usuarioId: 'user1',
    });
    expect(movement.ajuste).toBe(10);
  });

  it('should throw if motivo is empty', () => {
    expect(() => new InventoryMovement({
      tipo: 'ENTRADA',
      productId: 'prod1',
      cantidad: 100,
      motivo: '   ',
      usuarioId: 'user1',
    })).toThrow('El movimiento debe tener un motivo');
  });

  it('should throw if cantidad is zero', () => {
    expect(() => new InventoryMovement({
      tipo: 'ENTRADA',
      productId: 'prod1',
      cantidad: 0,
      motivo: 'Compra',
      usuarioId: 'user1',
    })).toThrow('La cantidad debe ser mayor a cero');
  });

  it('should throw if cantidad is negative', () => {
    expect(() => new InventoryMovement({
      tipo: 'ENTRADA',
      productId: 'prod1',
      cantidad: -10,
      motivo: 'Compra',
      usuarioId: 'user1',
    })).toThrow('La cantidad debe ser mayor a cero');
  });

  it('should throw if neither productId nor rawMaterialId is provided', () => {
    expect(() => new InventoryMovement({
      tipo: 'ENTRADA',
      cantidad: 100,
      motivo: 'Compra',
      usuarioId: 'user1',
    })).toThrow('El movimiento debe estar asociado a un producto o insumo');
  });
});
