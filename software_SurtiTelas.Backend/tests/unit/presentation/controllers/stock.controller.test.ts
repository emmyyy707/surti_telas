import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { listSuppliers, createSupplier, updateSupplier, listRawMaterials, createRawMaterial, updateRawMaterial, registerMovement, listMovements, getStockAlerts } from '@/modules/stock/presentation/controllers/stock.controller';

vi.mock('@/modules/stock/infrastructure/container/stockContainer', () => ({
  stockUseCases: {
    getSuppliers: { execute: vi.fn() },
    createSupplier: { execute: vi.fn() },
    updateSupplier: { execute: vi.fn() },
    getRawMaterials: { execute: vi.fn() },
    createRawMaterial: { execute: vi.fn() },
    updateRawMaterial: { execute: vi.fn() },
    registerMovement: { execute: vi.fn() },
    getMovements: { execute: vi.fn() },
    getStockAlerts: { execute: vi.fn() },
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

describe('stock.controller', () => {
  it('listSuppliers should return paginated suppliers', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getSuppliers.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listSuppliers(req, res);

    expect(stockUseCases.getSuppliers.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });

  it('listSuppliers should support cursor pagination', async () => {
    const req = mockReq({ query: { limit: 10, cursor: 'test-cursor' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getSuppliers.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, nextCursor: 'next-cursor' } });

    await listSuppliers(req, res);

    expect(stockUseCases.getSuppliers.execute).toHaveBeenCalledWith({ limit: 10, cursor: 'test-cursor' });
    expect(res.json).toHaveBeenCalled();
  });

  it('createSupplier should create supplier', async () => {
    const req = mockReq({ body: { nombre: 'Proveedor Test', nit: '900123456-1' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.createSupplier.execute as any).mockResolvedValue({ id: '1', nombre: 'Proveedor Test' });

    await createSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('updateSupplier should update supplier', async () => {
    const req = mockReq({ params: { id: '1' }, body: { nombre: 'Updated' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.updateSupplier.execute as any).mockResolvedValue({ id: '1', nombre: 'Updated' });

    await updateSupplier(req, res);

    expect(stockUseCases.updateSupplier.execute).toHaveBeenCalledWith('1', { nombre: 'Updated' });
  });

  it('listRawMaterials should return paginated raw materials', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getRawMaterials.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listRawMaterials(req, res);

    expect(stockUseCases.getRawMaterials.execute).toHaveBeenCalled();
  });

  it('listRawMaterials should support cursor pagination', async () => {
    const req = mockReq({ query: { limit: 10, cursor: 'test-cursor' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getRawMaterials.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, nextCursor: 'next-cursor' } });

    await listRawMaterials(req, res);

    expect(stockUseCases.getRawMaterials.execute).toHaveBeenCalledWith({ limit: 10, cursor: 'test-cursor' });
    expect(res.json).toHaveBeenCalled();
  });

  it('createRawMaterial should create raw material', async () => {
    const req = mockReq({ body: { nombre: 'Algodón', categoria: 'Tela', unidadMedida: 'm', stockActual: 100, stockMinimo: 10, precioUnitario: 5000 } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.createRawMaterial.execute as any).mockResolvedValue({ id: '1', nombre: 'Algodón' });

    await createRawMaterial(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateRawMaterial should update raw material', async () => {
    const req = mockReq({ params: { id: '1' }, body: { nombre: 'Updated' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.updateRawMaterial.execute as any).mockResolvedValue({ id: '1', nombre: 'Updated' });

    await updateRawMaterial(req, res);

    expect(stockUseCases.updateRawMaterial.execute).toHaveBeenCalledWith('1', { nombre: 'Updated' });
  });

  it('registerMovement should register movement with usuarioId from user', async () => {
    const req = mockReq({ body: { tipo: 'ENTRADA', rawMaterialId: 'rm-1', cantidad: 100, motivo: 'Compra' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.registerMovement.execute as any).mockResolvedValue({ id: '1', tipo: 'ENTRADA' });

    await registerMovement(req, res);

    expect(stockUseCases.registerMovement.execute).toHaveBeenCalledWith({ tipo: 'ENTRADA', rawMaterialId: 'rm-1', cantidad: 100, motivo: 'Compra', usuarioId: 'user-1' }, undefined);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('listMovements should return paginated movements', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getMovements.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listMovements(req, res);

    expect(stockUseCases.getMovements.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('listMovements should support cursor pagination', async () => {
    const req = mockReq({ query: { limit: 10, cursor: 'test-cursor' } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getMovements.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, nextCursor: 'next-cursor' } });

    await listMovements(req, res);

    expect(stockUseCases.getMovements.execute).toHaveBeenCalledWith({ limit: 10, cursor: 'test-cursor' });
    expect(res.json).toHaveBeenCalled();
  });

  it('getStockAlerts should return stock alerts', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { stockUseCases } = await import('@/modules/stock/infrastructure/container/stockContainer');
    (stockUseCases.getStockAlerts.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await getStockAlerts(req, res);

    expect(stockUseCases.getStockAlerts.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });
});
