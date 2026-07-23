import { describe, it, expect } from 'vitest';
import { toRawMaterialData } from '@/modules/stock/infrastructure/mappers/RawMaterialMapper';

const dec = (n: number) => ({ toNumber: () => n });

const row = {
  id: 'rm-1',
  nombre: 'Hilo',
  categoria: 'Insumos',
  unidadMedida: 'm',
  stockActual: 100,
  stockMinimo: 20,
  proveedorId: 'sup-1',
  precioUnitario: dec(50),
};

describe('RawMaterialMapper.toRawMaterialData', () => {
  it('maps a DB row into RawMaterialData', () => {
    const data = toRawMaterialData(row);
    expect(data).toMatchObject({
      id: 'rm-1',
      nombre: 'Hilo',
      categoria: 'Insumos',
      unidadMedida: 'm',
      stockActual: 100,
      stockMinimo: 20,
      proveedorId: 'sup-1',
      precioUnitario: 50,
    });
  });

  it('returns undefined for nullable fields', () => {
    const data = toRawMaterialData({
      ...row,
      categoria: null,
      proveedorId: null,
    });
    expect(data.categoria).toBeUndefined();
    expect(data.proveedorId).toBeUndefined();
  });
});
