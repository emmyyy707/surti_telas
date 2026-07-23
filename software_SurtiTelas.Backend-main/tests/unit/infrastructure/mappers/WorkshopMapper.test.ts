import { describe, it, expect } from 'vitest';
import { toWorkshopData, WORKSHOP_STATUS_TO_DB } from '@/modules/production/infrastructure/mappers/WorkshopMapper';

const row = {
  id: 'w-1',
  nombre: 'Taller Norte',
  encargadoId: 'op-1',
  direccion: 'Calle 1',
  ciudad: 'Bogotá',
  estado: 'ACTIVO',
  capacidad: 200,
};

describe('WorkshopMapper.toWorkshopData', () => {
  it('maps a DB row into WorkshopData', () => {
    const data = toWorkshopData(row);
    expect(data).toMatchObject({
      id: 'w-1',
      nombre: 'Taller Norte',
      encargadoId: 'op-1',
      direccion: 'Calle 1',
      ciudad: 'Bogotá',
      estado: 'ACTIVO',
      capacidad: 200,
    });
  });

  it('returns undefined for nullable fields', () => {
    const data = toWorkshopData({
      ...row,
      encargadoId: null,
      direccion: null,
      ciudad: null,
      capacidad: null,
    });
    expect(data.encargadoId).toBeUndefined();
    expect(data.direccion).toBeUndefined();
    expect(data.ciudad).toBeUndefined();
    expect(data.capacidad).toBeUndefined();
  });

  it('exposes WORKSHOP_STATUS_TO_DB mapping', () => {
    expect(WORKSHOP_STATUS_TO_DB).toEqual({ ACTIVO: 'ACTIVO', INACTIVO: 'INACTIVO' });
  });
});
