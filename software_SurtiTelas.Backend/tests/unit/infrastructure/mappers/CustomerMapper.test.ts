import { describe, it, expect } from 'vitest';
import { toCustomerData, STATUS_TO_DB } from '@/modules/customers/infrastructure/mappers/CustomerMapper';

const dec = (n: number) => ({ toNumber: () => n });

const row = {
  id: 'cust-1',
  nombre: 'Juan Pérez',
  ciudad: 'Bogotá',
  telefono: '1234567',
  asesorId: 'ase-1',
  asesor: { nombre: 'Asesor A' },
  nit: '900123',
  cupoTotal: dec(100000),
  cupoUsado: dec(30000),
  deudaVencida: dec(5000),
  isTrustedCustomer: true,
  estado: 'ACTIVO' as const,
  _count: { orders: 4 },
};

describe('CustomerMapper.toCustomerData', () => {
  it('maps a DB row into CustomerData', () => {
    const data = toCustomerData(row);
    expect(data).toMatchObject({
      id: 'cust-1',
      nombre: 'Juan Pérez',
      ciudad: 'Bogotá',
      tel: '1234567',
      asesorId: 'ase-1',
      asesor: 'Asesor A',
      nit: '900123',
      cupoTotal: 100000,
      cupoUsado: 30000,
      deudaVencida: 5000,
      isTrustedCustomer: true,
      estado: 'Activo',
      pedidos: 4,
    });
  });

  it('returns empty strings for nullable fields', () => {
    const data = toCustomerData({
      ...row,
      ciudad: null,
      telefono: null,
      asesorId: null,
      asesor: null,
      nit: null,
    });
    expect(data.ciudad).toBe('');
    expect(data.tel).toBe('');
    expect(data.asesorId).toBeUndefined();
    expect(data.asesor).toBe('');
    expect(data.nit).toBeUndefined();
  });

  it('exposes STATUS_TO_DB mapping', () => {
    expect(STATUS_TO_DB).toEqual({ Activo: 'ACTIVO', Inactivo: 'INACTIVO' });
  });
});
