import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { listWorkshops, createWorkshop, updateWorkshop, listProductionOrders, createProductionOrder, assignToWorkshop, updateProgress, completeProduction, getProductionAlerts } from '@/modules/production/presentation/controllers/production.controller';

vi.mock('@/modules/production/infrastructure/container/productionContainer', () => ({
  productionUseCases: {
    getWorkshops: { execute: vi.fn() },
    registerWorkshop: { execute: vi.fn() },
    updateWorkshop: { execute: vi.fn() },
    getProductionOrders: { execute: vi.fn() },
    createProductionOrder: { execute: vi.fn() },
    assignToWorkshop: { execute: vi.fn() },
    updateProgress: { execute: vi.fn() },
    completeProduction: { execute: vi.fn() },
    getProductionAlerts: { execute: vi.fn() },
  },
}));

const mockReq = (overrides = {}) => ({ user: { id: 'user-1', role: 'ADMIN' }, body: {}, params: {}, query: {}, ...overrides }) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('production.controller', () => {
  it('listWorkshops should return paginated workshops', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.getWorkshops.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listWorkshops(req, res);

    expect(productionUseCases.getWorkshops.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });

  it('listWorkshops should support cursor pagination', async () => {
    const req = mockReq({ query: { limit: 10, cursor: 'test-cursor' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.getWorkshops.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, nextCursor: 'next-cursor' } });

    await listWorkshops(req, res);

    expect(productionUseCases.getWorkshops.execute).toHaveBeenCalledWith({ limit: 10, cursor: 'test-cursor' });
    expect(res.json).toHaveBeenCalled();
  });

  it('createWorkshop should create workshop', async () => {
    const req = mockReq({ body: { nombre: 'Taller Test', ciudad: 'Bogotá' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.registerWorkshop.execute as any).mockResolvedValue({ id: '1', nombre: 'Taller Test' });

    await createWorkshop(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('updateWorkshop should update workshop', async () => {
    const req = mockReq({ params: { id: '1' }, body: { nombre: 'Updated' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.updateWorkshop.execute as any).mockResolvedValue({ id: '1', nombre: 'Updated' });

    await updateWorkshop(req, res);

    expect(productionUseCases.updateWorkshop.execute).toHaveBeenCalledWith('1', { nombre: 'Updated' });
  });

  it('listProductionOrders should return paginated production orders', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.getProductionOrders.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listProductionOrders(req, res);

    expect(productionUseCases.getProductionOrders.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('listProductionOrders should support cursor pagination', async () => {
    const req = mockReq({ query: { limit: 10, cursor: 'test-cursor' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.getProductionOrders.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, nextCursor: 'next-cursor' } });

    await listProductionOrders(req, res);

    expect(productionUseCases.getProductionOrders.execute).toHaveBeenCalledWith({ limit: 10, cursor: 'test-cursor' });
    expect(res.json).toHaveBeenCalled();
  });

  it('createProductionOrder should create production order', async () => {
    const req = mockReq({ body: { referencia: 'REF-001', cantidad: 100, fechaEstimada: '2025-12-31', colores: ['Blanco'] } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.createProductionOrder.execute as any).mockResolvedValue({ id: '1', referencia: 'REF-001' });

    await createProductionOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('assignToWorkshop should assign to workshop', async () => {
    const req = mockReq({ params: { id: '1' }, body: { tallerId: 'taller-1' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.assignToWorkshop.execute as any).mockResolvedValue({ id: '1', tallerId: 'taller-1' });

    await assignToWorkshop(req, res);

    expect(productionUseCases.assignToWorkshop.execute).toHaveBeenCalledWith('1', 'taller-1');
  });

  it('updateProgress should update progress', async () => {
    const req = mockReq({ params: { id: '1' }, body: { avance: 50 } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.updateProgress.execute as any).mockResolvedValue({ id: '1', avance: 50 });

    await updateProgress(req, res);

    expect(productionUseCases.updateProgress.execute).toHaveBeenCalledWith('1', 50);
  });

  it('completeProduction should complete production', async () => {
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.completeProduction.execute as any).mockResolvedValue({ id: '1', estado: 'TERMINADO' });

    await completeProduction(req, res);

    expect(productionUseCases.completeProduction.execute).toHaveBeenCalledWith('1', undefined);
  });

  it('getProductionAlerts should return production alerts', async () => {
    const req = mockReq();
    const res = mockRes();
    const { productionUseCases } = await import('@/modules/production/infrastructure/container/productionContainer');
    (productionUseCases.getProductionAlerts.execute as any).mockResolvedValue([]);

    await getProductionAlerts(req, res);

    expect(productionUseCases.getProductionAlerts.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });
});
