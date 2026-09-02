import { describe, it, expect } from 'vitest';
import {
  toOrderData,
  orderStatusToDb,
  dbToOrderStatus,
  orderPriorityToDb,
} from '@/modules/orders/infrastructure/mappers/OrderMapper';
import type { OrderStatus, OrderPriority } from '@/modules/orders/domain/entities/Order';

const dec = (n: number) => ({ toNumber: () => n });

const row = {
  id: 'order-1',
  numero: 'PED-0001',
  clienteId: 'cli-1',
  cliente: { nombre: 'Cliente A' },
  clienteNombre: 'Cliente Snapshot',
  asesorId: 'ase-1',
  asesor: { nombre: 'Asesor A' },
  asesorNombre: 'Asesor Snapshot',
  fecha: new Date('2026-01-01T00:00:00.000Z'),
  subtotal: dec(5000),
  impuestos: dec(950),
  descuentos: dec(0),
  total: dec(5000),
  itemsCount: 3,
  estado: 'EN_PRODUCCION' as const,
  prioridad: 'PRIORITARIO' as const,
  observaciones: 'Frágil',
  medioPago: 'TRANSFER',
  fechaValidacion: null,
  usuarioValidacionId: null,
  usuarioValidacion: null,
  razonRechazo: null,
  observacionesRechazo: null,
  comprobantePagoUrl: null,
  comprobantePagoNombre: null,
  comprobantePagoMime: null,
  comprobantePagoTamaño: null,
  comprobantePagoCargadoEn: null,
  comprobantePagoCargadoPorId: null,
  comprobantePagoCargadoPor: null,
  comprobantePagoEstado: null,
  comprobantePagoObservaciones: null,
  items: [
    { productId: 'p-1', nombre: 'Camiseta', precio: dec(1000), cantidad: 2 },
    { productId: null, nombre: 'Pantalón', precio: dec(3000), cantidad: 1 },
  ],
  venta: null,
  diasCredito: null,
  descuentoEspecial: null,
  envioGratis: null,
  prioridadEnvio: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

describe('OrderMapper.toOrderData', () => {
  it('maps a DB row into OrderData with snapshots and items', () => {
    const data = toOrderData(row);
    expect(data).toMatchObject({
      id: 'order-1',
      numero: 'PED-0001',
      cliente: 'Cliente Snapshot',
      asesor: 'Asesor Snapshot',
      items: 3,
      total: 5000,
      estado: 'Listo',
      prioridad: 'Prioritario',
      observaciones: 'Frágil',
    });
    expect(data.itemsList).toEqual([
      { productId: 'p-1', nombre: 'Camiseta', precio: 1000, cantidad: 2 },
      { productId: undefined, nombre: 'Pantalón', precio: 3000, cantidad: 1 },
    ]);
  });

  it('falls back to relation names when snapshot is empty', () => {
    const data = toOrderData({
      ...row,
      clienteNombre: '',
      asesorNombre: '',
    });
    expect(data.cliente).toBe('Cliente A');
    expect(data.asesor).toBe('Asesor A');
  });

  it('serializes dates to ISO strings', () => {
    const data = toOrderData(row);
    expect(data.fecha).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns undefined observaciones when null', () => {
    const data = toOrderData({ ...row, observaciones: null });
    expect(data.observaciones).toBeUndefined();
  });

  it('calculates items from itemsList even when itemsCount is inconsistent (BUG-1)', () => {
    const inconsistentRow = {
      ...row,
      itemsCount: 1,
      items: [
        { productId: 'p-1', nombre: 'Producto base', precio: dec(1000), cantidad: 15 },
      ],
    };
    const data = toOrderData(inconsistentRow);
    expect(data.items).toBe(15);
    expect(data.itemsList).toEqual([
      { productId: 'p-1', nombre: 'Producto base', precio: 1000, cantidad: 15 },
    ]);
  });

  it('maps venta when present (BUG-2)', () => {
    const rowWithSale = {
      ...row,
      venta: {
        id: 'sale-1',
        orderId: 'order-1',
        clienteId: 'cli-1',
        clienteNombre: 'Cliente Snapshot',
        asesorId: 'ase-1',
        asesorNombre: 'Asesor Snapshot',
        fechaVenta: new Date('2026-01-02T00:00:00.000Z'),
        subtotal: dec(5000),
        impuestos: dec(950),
        descuentos: dec(0),
        total: dec(5950),
        estado: 'COMPLETADA',
        medioPago: 'TRANSFER',
      },
    };
    const data = toOrderData(rowWithSale);
    expect(data.venta).toEqual({
      id: 'sale-1',
      orderId: 'order-1',
      clienteId: 'cli-1',
      clienteNombre: 'Cliente Snapshot',
      asesorId: 'ase-1',
      asesorNombre: 'Asesor Snapshot',
      fechaVenta: '2026-01-02T00:00:00.000Z',
      subtotal: 5000,
      impuestos: 950,
      descuentos: 0,
      total: 5950,
      estado: 'COMPLETADA',
      medioPago: 'TRANSFER',
    });
  });

  it('returns undefined venta when not present', () => {
    const data = toOrderData(row);
    expect(data.venta).toBeUndefined();
  });
});

describe('OrderMapper status/priority converters', () => {
  it('converts domain status to db and back', () => {
    const status: OrderStatus = 'Entregado';
    expect(orderStatusToDb(status)).toBe('ENTREGADO');
    expect(dbToOrderStatus('ENTREGADO')).toBe('Entregado');
  });

  it('converts priority to db', () => {
    const priority: OrderPriority = 'Estándar';
    expect(orderPriorityToDb(priority)).toBe('ESTANDAR');
  });
});
