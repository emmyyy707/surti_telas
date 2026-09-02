import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { getOrders, getOrdersMe, getOrderById, createOrder, updateOrderStatus, assignDomiciliario } from '@/modules/orders/presentation/controllers/order.controller';

vi.mock('@/modules/orders/infrastructure/container/orderContainer', () => ({
  orderUseCases: {
    getOrders: { execute: vi.fn() },
    getOrderById: { execute: vi.fn() },
    createOrder: { execute: vi.fn() },
    updateOrderStatus: { execute: vi.fn() },
    assignDomiciliario: { execute: vi.fn() },
  },
}));

vi.mock('@/config/database', () => ({
  prisma: {
    customer: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}));

const mockReq = (overrides = {}) => ({ user: { id: 'user-1', role: 'ADMIN', nombre: 'Admin' }, body: {}, params: {}, query: {}, requestId: 'test-request-id', ...overrides }) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('order.controller', () => {
  it('getOrders should filter by asesorId for ASESOR role', async () => {
    const req = mockReq({ user: { id: 'asesor-1', role: 'ASESOR', nombre: 'Asesor' }, query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.getOrders.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await getOrders(req, res);

    expect(orderUseCases.getOrders.execute).toHaveBeenCalledWith(expect.objectContaining({ asesorId: 'asesor-1', page: 1, limit: 10 }));
  });

  it('getOrdersMe should call getOrders with clienteId filter and parsed query params', async () => {
    const req = mockReq({ 
      user: { id: 'cli-1', role: 'CLIENTE', nombre: 'Cliente', email: 'cli@test.com' }, 
      query: { page: 2, limit: 10, estado: 'Pendiente', sort: 'fecha', order: 'asc' } 
    });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.getOrders.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 2, limit: 10 } });
    const { prisma } = await import('@/config/database');
    (prisma.customer.findFirst as any).mockResolvedValue({ id: 'cli-1', nombre: 'Cliente', email: 'cli@test.com' });

    await getOrdersMe(req, res);

    expect(orderUseCases.getOrders.execute).toHaveBeenCalledWith(expect.objectContaining({ 
      clienteId: 'cli-1',
      page: 2,
      limit: 10,
      estado: 'Pendiente',
      sort: 'fecha',
      order: 'asc'
    }));
  });

  it('getOrderById should return order with HATEOAS links', async () => {
    const req = mockReq({ user: { id: 'user-1', role: 'ADMIN', nombre: 'Admin' }, params: { id: '1' } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.getOrderById.execute as any).mockResolvedValue({ id: '1', cliente: 'Cliente X', asesor: 'user-1' });

    await getOrderById(req, res);

    expect(orderUseCases.getOrderById.execute).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.data).toHaveProperty('_links');
    expect(jsonCall.data._links.self).toBe('/api/v1/orders/1');
  });

  it('getOrderById should throw 403 if user is not owner or admin', async () => {
    const req = mockReq({ user: { id: 'user-1', role: 'ASESOR', nombre: 'Asesor X' }, params: { id: '1' } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.getOrderById.execute as any).mockResolvedValue({ id: '1', cliente: 'Cliente X', asesor: 'other-asesor' });

    await expect(getOrderById(req, res)).rejects.toThrow('No tienes acceso a este pedido');
  });

  it('createOrder should use asesorId from user for ASESOR', async () => {
    const req = mockReq({ user: { id: 'asesor-1', role: 'ASESOR', nombre: 'Asesor' }, body: { clienteId: 'cli-1', itemsList: [{ nombre: 'Item', precio: 1000, cantidad: 1 }] } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.createOrder.execute as any).mockResolvedValue({ id: '1', numero: 'PED-000001' });

    await createOrder(req, res);

    expect(orderUseCases.createOrder.execute).toHaveBeenCalledWith({ clienteId: 'cli-1', itemsList: [{ nombre: 'Item', precio: 1000, cantidad: 1 }], asesorId: 'asesor-1' }, expect.any(String), { id: 'asesor-1', email: undefined, nombre: 'Asesor', role: 'ASESOR' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateOrderStatus should throw 403 if user is not owner or admin', async () => {
    const req = mockReq({ user: { id: 'user-1', role: 'ASESOR', nombre: 'Asesor X' }, params: { id: '1' }, body: { estado: 'Aceptado' } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.getOrderById.execute as any).mockResolvedValue({ id: '1', cliente: 'Cliente', asesor: 'other-asesor' });

    await expect(updateOrderStatus(req, res)).rejects.toThrow('No tienes acceso a este pedido');
  });

  it('assignDomiciliario should assign domiciliario', async () => {
    const req = mockReq({ params: { id: '1' }, body: { domiciliarioId: 'dom-1' } });
    const res = mockRes();
    const { orderUseCases } = await import('@/modules/orders/infrastructure/container/orderContainer');
    (orderUseCases.assignDomiciliario.execute as any).mockResolvedValue({ id: '1' });
    const { prisma } = await import('@/config/database');
    (prisma.user.findFirst as any).mockResolvedValue({ nombre: 'Domiciliario Test' });

    await assignDomiciliario(req, res);

    expect(orderUseCases.assignDomiciliario.execute).toHaveBeenCalledWith('1', 'dom-1', 'Domiciliario Test', expect.any(String));
    expect(res.json).toHaveBeenCalled();
  });
});
