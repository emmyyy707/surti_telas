import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { listCustomers, getCustomer, createCustomer, updateCustomer, assignAsesor } from '@/modules/customers/presentation/controllers/customer.controller';

vi.mock('@/modules/customers/infrastructure/container/customerContainer', () => ({
  customerUseCases: {
    createCustomer: { execute: vi.fn() },
    getCustomers: { execute: vi.fn() },
    getCustomerById: { execute: vi.fn() },
    updateCustomer: { execute: vi.fn() },
    assignAsesor: { execute: vi.fn() },
    updateCupo: { execute: vi.fn() },
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

describe('customer.controller', () => {
  it('should return paginated customers', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { customerUseCases } = await import('@/modules/customers/infrastructure/container/customerContainer');
    (customerUseCases.getCustomers.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listCustomers(req, res);

    expect(customerUseCases.getCustomers.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });

  it('should return customer by id with HATEOAS links', async () => {
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    const { customerUseCases } = await import('@/modules/customers/infrastructure/container/customerContainer');
    (customerUseCases.getCustomerById.execute as any).mockResolvedValue({ id: '1', nombre: 'Juan' });

    await getCustomer(req, res);

    expect(customerUseCases.getCustomerById.execute).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.data).toHaveProperty('_links');
    expect(jsonCall.data._links.self).toBe('/api/v1/customers/1');
  });

  it('should create customer', async () => {
    const req = mockReq({ body: { nombre: 'Juan', ciudad: 'Bogotá', tel: '3001234567', nit: '900123456-7', cupoTotal: 500000, estado: 'Activo' } });
    const res = mockRes();
    const { customerUseCases } = await import('@/modules/customers/infrastructure/container/customerContainer');
    (customerUseCases.createCustomer.execute as any).mockResolvedValue({ id: '1', nombre: 'Juan' });

    await createCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('should update customer', async () => {
    const req = mockReq({ params: { id: '1' }, body: { nombre: 'Updated' } });
    const res = mockRes();
    const { customerUseCases } = await import('@/modules/customers/infrastructure/container/customerContainer');
    (customerUseCases.updateCustomer.execute as any).mockResolvedValue({ id: '1', nombre: 'Updated' });

    await updateCustomer(req, res);

    expect(customerUseCases.updateCustomer.execute).toHaveBeenCalledWith('1', { nombre: 'Updated' });
  });

  it('should assign asesor to customer', async () => {
    const req = mockReq({ params: { id: '1' }, body: { asesorId: 'asesor-1' } });
    const res = mockRes();
    const { customerUseCases } = await import('@/modules/customers/infrastructure/container/customerContainer');
    (customerUseCases.assignAsesor.execute as any).mockResolvedValue({ id: '1', asesorId: 'asesor-1' });

    await assignAsesor(req, res);

    expect(customerUseCases.assignAsesor.execute).toHaveBeenCalledWith('1', 'asesor-1');
    expect(res.json).toHaveBeenCalled();
  });
});
