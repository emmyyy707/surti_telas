import { describe, it, expect } from 'vitest';
import { ProductionOrder } from '@/modules/production/domain/entities/ProductionOrder';

describe('ProductionOrder', () => {
  it('should create a valid production order', () => {
    const order = new ProductionOrder({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date('2024-12-31'),
      avance: 0,
      estado: 'PENDIENTE',
      colores: ['Rojo', 'Azul'],
    });

    expect(order.referencia).toBe('REF-001');
    expect(order.cantidad).toBe(100);
    expect(order.avance).toBe(0);
    expect(order.estado).toBe('PENDIENTE');
  });

  it('should throw error if referencia is empty', () => {
    expect(() => {
      new ProductionOrder({
        referencia: '',
        cantidad: 100,
        fechaEstimada: new Date(),
        avance: 0,
        estado: 'PENDIENTE',
        colores: ['Rojo'],
      });
    }).toThrow('La orden de producción debe tener una referencia');
  });

  it('should throw error if cantidad is zero or negative', () => {
    expect(() => {
      new ProductionOrder({
        referencia: 'REF-001',
        cantidad: 0,
        fechaEstimada: new Date(),
        avance: 0,
        estado: 'PENDIENTE',
        colores: ['Rojo'],
      });
    }).toThrow('La cantidad debe ser mayor a cero');
  });

  it('should throw error if avance is out of range', () => {
    expect(() => {
      new ProductionOrder({
        referencia: 'REF-001',
        cantidad: 100,
        fechaEstimada: new Date(),
        avance: 150,
        estado: 'PENDIENTE',
        colores: ['Rojo'],
      });
    }).toThrow('El avance debe estar entre 0 y 100');
  });

  it('should update progress and estado to EN_PROCESO when avance > 0', () => {
    const order = new ProductionOrder({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date(),
      avance: 0,
      estado: 'PENDIENTE',
      colores: ['Rojo'],
    });

    const updated = order.withProgress(50);
    expect(updated.avance).toBe(50);
    expect(updated.estado).toBe('EN_PROCESO');
  });

  it('should update progress and estado to TERMINADO when avance = 100', () => {
    const order = new ProductionOrder({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date(),
      avance: 0,
      estado: 'PENDIENTE',
      colores: ['Rojo'],
    });

    const updated = order.withProgress(100);
    expect(updated.avance).toBe(100);
    expect(updated.estado).toBe('TERMINADO');
  });

  it('should return true when can finish', () => {
    const order = new ProductionOrder({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date(),
      avance: 100,
      estado: 'TERMINADO',
      colores: ['Rojo'],
    });

    expect(order.puedeTerminar()).toBe(true);
  });

  it('should return false when cannot finish', () => {
    const order = new ProductionOrder({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date(),
      avance: 50,
      estado: 'EN_PROCESO',
      colores: ['Rojo'],
    });

    expect(order.puedeTerminar()).toBe(false);
  });
});
