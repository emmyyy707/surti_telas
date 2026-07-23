import { describe, it, expect } from 'vitest';
import {
  toProductionOrderData,
  productionStatusToDb,
  dbToProductionStatus,
} from '@/modules/production/infrastructure/mappers/ProductionOrderMapper';
import type { ProductionStatus } from '@/modules/production/domain/entities/ProductionOrder';

const row = {
  id: 'prod-1',
  pedidoId: 'order-1',
  operarioId: 'op-1',
  tallerId: 'taller-1',
  referencia: 'REF-001',
  cantidad: 100,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaEstimada: new Date('2026-01-10T00:00:00.000Z'),
  avance: 40,
  estado: 'EN_PROCESO' as const,
  tela: 'Algodón',
  colores: ['Blanco'],
  curvaTallas: { s: 10, m: 20, l: 30 },
  notasTecnicas: 'Coser refuerzo',
};

describe('ProductionOrderMapper.toProductionOrderData', () => {
  it('maps a DB row into ProductionOrderData', () => {
    const data = toProductionOrderData(row);
    expect(data).toMatchObject({
      id: 'prod-1',
      pedidoId: 'order-1',
      operarioId: 'op-1',
      tallerId: 'taller-1',
      referencia: 'REF-001',
      cantidad: 100,
      avance: 40,
      estado: 'EN_PROCESO',
      tela: 'Algodón',
      colores: ['Blanco'],
      curvaTallas: { s: 10, m: 20, l: 30 },
      notasTecnicas: 'Coser refuerzo',
    });
  });

  it('returns undefined for nullable fields', () => {
    const data = toProductionOrderData({
      ...row,
      pedidoId: null,
      operarioId: null,
      tallerId: null,
      tela: null,
      curvaTallas: null,
      notasTecnicas: null,
    });
    expect(data.pedidoId).toBeUndefined();
    expect(data.operarioId).toBeUndefined();
    expect(data.tallerId).toBeUndefined();
    expect(data.tela).toBeUndefined();
    expect(data.curvaTallas).toBeUndefined();
    expect(data.notasTecnicas).toBeUndefined();
  });

  it('converts status to db and back', () => {
    const status: ProductionStatus = 'TERMINADO';
    expect(productionStatusToDb(status)).toBe('TERMINADO');
    expect(dbToProductionStatus('TERMINADO')).toBe('TERMINADO');
  });
});
