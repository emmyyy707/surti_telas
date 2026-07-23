import { describe, it, expect } from 'vitest';
import { Supplier } from '@/modules/stock/domain/entities/Supplier';

describe('Supplier', () => {
  it('should create a valid supplier', () => {
    const supplier = new Supplier({
      nombre: 'Proveedor Test',
      nit: '900123456-1',
      estado: 'ACTIVO',
      calificacion: 4,
      pedidosRealizados: 10,
      materiales: ['Algodón', 'Poliéster'],
    });

    expect(supplier.nombre).toBe('Proveedor Test');
    expect(supplier.nit).toBe('900123456-1');
    expect(supplier.estado).toBe('ACTIVO');
    expect(supplier.materiales).toContain('Algodón');
  });

  it('should throw error if nombre is empty', () => {
    expect(() => {
      new Supplier({
        nombre: '',
        nit: '900123456-1',
        estado: 'ACTIVO',
        calificacion: 0,
        pedidosRealizados: 0,
        materiales: [],
      });
    }).toThrow('El proveedor debe tener un nombre');
  });

  it('should throw error if nit is empty', () => {
    expect(() => {
      new Supplier({
        nombre: 'Test',
        nit: '',
        estado: 'ACTIVO',
        calificacion: 0,
        pedidosRealizados: 0,
        materiales: [],
      });
    }).toThrow('El proveedor debe tener un NIT');
  });

  it('should throw error if calificacion is out of range', () => {
    expect(() => {
      new Supplier({
        nombre: 'Test',
        nit: '900123456-1',
        estado: 'ACTIVO',
        calificacion: 6,
        pedidosRealizados: 0,
        materiales: [],
      });
    }).toThrow('La calificación debe estar entre 0 y 5');
  });

  it('should activate supplier', () => {
    const supplier = new Supplier({
      nombre: 'Test',
      nit: '900123456-1',
      estado: 'INACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      materiales: [],
    });

    const activated = supplier.activate();
    expect(activated.estado).toBe('ACTIVO');
  });

  it('should deactivate supplier', () => {
    const supplier = new Supplier({
      nombre: 'Test',
      nit: '900123456-1',
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      materiales: [],
    });

    const deactivated = supplier.deactivate();
    expect(deactivated.estado).toBe('INACTIVO');
  });
});
