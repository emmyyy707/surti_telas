import { describe, it, expect } from 'vitest';
import { RawMaterial } from '@/modules/stock/domain/entities/RawMaterial';

describe('RawMaterial', () => {
  it('should create a valid raw material', () => {
    const material = new RawMaterial({
      nombre: 'Algodón',
      categoria: 'Telas',
      unidadMedida: 'kg',
      stockActual: 100,
      stockMinimo: 20,
      precioUnitario: 5000,
    });

    expect(material.nombre).toBe('Algodón');
    expect(material.stockActual).toBe(100);
    expect(material.stockMinimo).toBe(20);
    expect(material.necesitaReposicion()).toBe(false);
  });

  it('should throw error if nombre is empty', () => {
    expect(() => {
      new RawMaterial({
        nombre: '',
        unidadMedida: 'kg',
        stockActual: 10,
        stockMinimo: 5,
        precioUnitario: 1000,
      });
    }).toThrow('El insumo debe tener un nombre');
  });

  it('should throw error if stockActual is negative', () => {
    expect(() => {
      new RawMaterial({
        nombre: 'Test',
        unidadMedida: 'kg',
        stockActual: -1,
        stockMinimo: 5,
        precioUnitario: 1000,
      });
    }).toThrow('El stock actual no puede ser negativo');
  });

  it('should return true when needs restock', () => {
    const material = new RawMaterial({
      nombre: 'Algodón',
      unidadMedida: 'kg',
      stockActual: 15,
      stockMinimo: 20,
      precioUnitario: 5000,
    });

    expect(material.necesitaReposicion()).toBe(true);
  });

  it('should reduce stock correctly', () => {
    const material = new RawMaterial({
      nombre: 'Algodón',
      unidadMedida: 'kg',
      stockActual: 100,
      stockMinimo: 20,
      precioUnitario: 5000,
    });

    const updated = material.withStock(80);
    expect(updated.stockActual).toBe(80);
  });

  it('should not reduce stock below zero', () => {
    const material = new RawMaterial({
      nombre: 'Algodón',
      unidadMedida: 'kg',
      stockActual: 10,
      stockMinimo: 5,
      precioUnitario: 5000,
    });

    const updated = material.withStock(-5);
    expect(updated.stockActual).toBe(0);
  });
});
