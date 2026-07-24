import { describe, it, expect } from 'vitest';
import { Order, type OrderStatus } from '@/modules/orders/domain/entities/Order';

describe('Order entity', () => {
  const makeOrder = (overrides = {}): Order => {
    const base = {
      id: 'order-1',
      numero: 'PED-000001',
      cliente: 'Juan',
      asesor: 'Asesor',
      fecha: new Date().toISOString(),
      items: 2,
      total: 50000,
      estado: 'Nuevo' as OrderStatus,
      itemsList: [
        { nombre: 'Camiseta', precio: 25000, cantidad: 2 },
      ],
    };
    return new Order({ ...base, ...overrides });
  };

  describe('validation', () => {
    it('should create valid order', () => {
      const order = makeOrder();
      expect(order.id).toBe('order-1');
      expect(order.estado).toBe('Nuevo');
    });

    it('should throw when id is empty', () => {
      expect(() => makeOrder({ id: '' })).toThrow('identificador');
    });

    it('should throw when cliente is empty', () => {
      expect(() => makeOrder({ cliente: '' })).toThrow('cliente');
    });

    it('should throw when asesor is empty', () => {
      expect(() => makeOrder({ asesor: '' })).toThrow('asesor');
    });

    it('should throw when total is negative', () => {
      expect(() => makeOrder({ total: -1 })).toThrow('total');
    });

    it('should throw when items count does not match itemsList', () => {
      expect(() => makeOrder({ items: 3, itemsList: [{ nombre: 'A', precio: 1000, cantidad: 1 }] })).toThrow('items');
    });

    it('should throw when itemsList is empty', () => {
      expect(() => makeOrder({ items: 0, itemsList: [] })).toThrow('item');
    });

    it('should throw when item has invalid data', () => {
      expect(() => makeOrder({
        items: 1,
        itemsList: [{ nombre: '', precio: -1, cantidad: 0 }],
      })).toThrow('items');
    });
  });

  describe('canTransitionTo', () => {
    it('should allow Nuevo -> En produccion', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      expect(order.canTransitionTo('En producción')).toBe(true);
    });

    it('should allow Nuevo -> Cancelado', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      expect(order.canTransitionTo('Cancelado')).toBe(true);
    });

    it('should reject Nuevo -> Entregado', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      expect(order.canTransitionTo('Entregado')).toBe(false);
    });

    it('should allow En produccion -> Listo', () => {
      const order = makeOrder({ estado: 'En producción' });
      expect(order.canTransitionTo('Listo')).toBe(true);
    });

    it('should allow En produccion -> Cancelado', () => {
      const order = makeOrder({ estado: 'En producción' });
      expect(order.canTransitionTo('Cancelado')).toBe(true);
    });

    it('should reject En produccion -> Entregado', () => {
      const order = makeOrder({ estado: 'En producción' });
      expect(order.canTransitionTo('Entregado')).toBe(false);
    });

    it('should allow same status transition', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      expect(order.canTransitionTo('Nuevo')).toBe(true);
    });

    it('should not allow transitions from Entregado', () => {
      const order = makeOrder({ estado: 'Entregado' });
      expect(order.canTransitionTo('Nuevo')).toBe(false);
      expect(order.canTransitionTo('Cancelado')).toBe(false);
    });

    it('should not allow transitions from Cancelado', () => {
      const order = makeOrder({ estado: 'Cancelado' });
      expect(order.canTransitionTo('Nuevo')).toBe(false);
      expect(order.canTransitionTo('Entregado')).toBe(false);
    });
  });

  describe('withStatus', () => {
    it('should create new order with updated status', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      const updated = order.withStatus('En producción');
      expect(updated.estado).toBe('En producción');
      expect(updated.id).toBe(order.id);
    });

    it('should use provided updatedAt', () => {
      const order = makeOrder({ estado: 'Nuevo' });
      const fixedDate = '2024-01-01T00:00:00.000Z';
      const updated = order.withStatus('En producción', fixedDate);
      expect(updated.updatedAt).toBe(fixedDate);
    });
  });

  describe('getItemsCount', () => {
    it('should return items count', () => {
      const order = makeOrder({ items: 2, itemsList: [{ nombre: 'A', precio: 1000, cantidad: 2 }] });
      expect(order.getItemsCount()).toBe(2);
    });
  });
});
