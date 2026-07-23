import { describe, it, expect } from 'vitest';
import { Customer } from '@/modules/customers/domain/entities/Customer';

describe('Customer', () => {
  it('should create a valid customer', () => {
    const customer = new Customer({
      nombre: 'Juan Pérez',
      ciudad: 'Bogotá',
      tel: '3001234567',
      cupoTotal: 1000000,
      cupoUsado: 0,
      deudaVencida: 0,
      isTrustedCustomer: true,
      estado: 'Activo',
      pedidos: 0,
    });

    expect(customer.nombre).toBe('Juan Pérez');
    expect(customer.cupoTotal).toBe(1000000);
    expect(customer.cupoUsado).toBe(0);
    expect(customer.estado).toBe('Activo');
  });

  it('should throw error if nombre is empty', () => {
    expect(() => {
      new Customer({
        nombre: '',
        ciudad: 'Bogotá',
        tel: '3001234567',
        cupoTotal: 1000000,
        cupoUsado: 0,
        deudaVencida: 0,
        isTrustedCustomer: false,
        estado: 'Activo',
        pedidos: 0,
      });
    }).toThrow('El cliente debe tener un nombre');
  });

  it('should throw error if cupoUsado > cupoTotal', () => {
    expect(() => {
      new Customer({
        nombre: 'Test',
        ciudad: 'Bogotá',
        tel: '3001234567',
        cupoTotal: 100000,
        cupoUsado: 150000,
        deudaVencida: 0,
        isTrustedCustomer: false,
        estado: 'Activo',
        pedidos: 0,
      });
    }).toThrow('El cupo usado no puede superar el cupo total');
  });

  it('should return true when cupo is available', () => {
    const customer = new Customer({
      nombre: 'Test',
      ciudad: 'Bogotá',
      tel: '3001234567',
      cupoTotal: 100000,
      cupoUsado: 50000,
      deudaVencida: 0,
      isTrustedCustomer: false,
      estado: 'Activo',
      pedidos: 0,
    });

    expect(customer.tieneCupoDisponible(30000)).toBe(true);
  });

  it('should return false when cupo is not available', () => {
    const customer = new Customer({
      nombre: 'Test',
      ciudad: 'Bogotá',
      tel: '3001234567',
      cupoTotal: 100000,
      cupoUsado: 90000,
      deudaVencida: 0,
      isTrustedCustomer: false,
      estado: 'Activo',
      pedidos: 0,
    });

    expect(customer.tieneCupoDisponible(20000)).toBe(false);
  });
});
