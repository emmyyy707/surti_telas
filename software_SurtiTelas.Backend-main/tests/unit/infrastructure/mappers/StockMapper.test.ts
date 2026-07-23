import { describe, it, expect } from 'vitest';
import {
  toSupplierData,
  SUPPLIER_STATUS_TO_DB,
  DB_TO_SUPPLIER_STATUS,
} from '@/modules/stock/infrastructure/mappers/StockMapper';

const row = {
  id: 'sup-1',
  nombre: 'Textiles S.A.',
  nit: '900123',
  telefono: '1234567',
  email: 'ventas@textiles.com',
  direccion: 'Calle 10',
  ciudad: 'Bogotá',
  materiales: ['Hilo', 'Tela'],
  estado: 'ACTIVO',
  calificacion: 4.5,
  pedidosRealizados: 12,
  ultimoPedido: new Date('2026-01-01T00:00:00.000Z'),
};

describe('StockMapper.toSupplierData', () => {
  it('maps a DB row into SupplierData', () => {
    const data = toSupplierData(row);
    expect(data).toMatchObject({
      id: 'sup-1',
      nombre: 'Textiles S.A.',
      nit: '900123',
      telefono: '1234567',
      email: 'ventas@textiles.com',
      direccion: 'Calle 10',
      ciudad: 'Bogotá',
      materiales: ['Hilo', 'Tela'],
      estado: 'ACTIVO',
      calificacion: 4.5,
      pedidosRealizados: 12,
      ultimoPedido: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('returns undefined for nullable fields', () => {
    const data = toSupplierData({
      ...row,
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      ultimoPedido: null,
    });
    expect(data.telefono).toBeUndefined();
    expect(data.email).toBeUndefined();
    expect(data.direccion).toBeUndefined();
    expect(data.ciudad).toBeUndefined();
    expect(data.ultimoPedido).toBeUndefined();
  });

  it('exposes status mappings', () => {
    expect(SUPPLIER_STATUS_TO_DB).toEqual({ ACTIVO: 'ACTIVO', INACTIVO: 'INACTIVO' });
    expect(DB_TO_SUPPLIER_STATUS['INACTIVO']).toBe('INACTIVO');
  });
});
