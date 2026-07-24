import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, publishProduct, unpublishProduct, listCategories, createCategory } from '@/modules/catalog/presentation/controllers/catalog.controller';

vi.mock('@/modules/catalog/infrastructure/container/catalogContainer', () => ({
  catalogUseCases: {
    getProducts: { execute: vi.fn() },
    getProductByRef: { execute: vi.fn() },
    createProduct: { execute: vi.fn() },
    updateProduct: { execute: vi.fn() },
    deleteProduct: { execute: vi.fn() },
    publishProduct: { execute: vi.fn() },
    unpublishProduct: { execute: vi.fn() },
    getCategories: { execute: vi.fn() },
    createCategory: { execute: vi.fn() },
  },
}));

const mockReq = (overrides = {}) => ({ user: { id: 'user-1', role: 'ADMIN' }, body: {}, params: {}, query: {}, ...overrides }) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('catalog.controller', () => {
  it('listProducts should return paginated products', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.getProducts.execute as any).mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10 } });

    await listProducts(req, res);

    expect(catalogUseCases.getProducts.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('getProduct should return product with HATEOAS links', async () => {
    const req = mockReq({ params: { ref: 'REF-001' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.getProductByRef.execute as any).mockResolvedValue({ ref: 'REF-001', nombre: 'Test' });

    await getProduct(req, res);

    expect(catalogUseCases.getProductByRef.execute).toHaveBeenCalledWith('REF-001');
    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.data).toHaveProperty('_links');
    expect(jsonCall.data._links.self).toBe('/api/v1/catalog/products/REF-001');
  });

  it('createProduct should create product', async () => {
    const req = mockReq({ body: { ref: 'REF-001', nombre: 'Test', categoria: 'Camisetas', precio: 1000, cantidadStock: 10, stock: 'OK', estado: 'Activo', tela: 'Algodón', colores: ['Blanco'], tallas: ['M'], imagenes: [], publicado: true } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.createProduct.execute as any).mockResolvedValue({ ref: 'REF-001', nombre: 'Test' });

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('updateProduct should update product', async () => {
    const req = mockReq({ params: { ref: 'REF-001' }, body: { nombre: 'Updated' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.updateProduct.execute as any).mockResolvedValue({ ref: 'REF-001', nombre: 'Updated' });

    await updateProduct(req, res);

    expect(catalogUseCases.updateProduct.execute).toHaveBeenCalledWith('REF-001', { nombre: 'Updated' });
    expect(res.json).toHaveBeenCalled();
  });

  it('deleteProduct should delete product', async () => {
    const req = mockReq({ params: { ref: 'REF-001' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.deleteProduct.execute as any).mockResolvedValue(undefined);

    await deleteProduct(req, res);

    expect(catalogUseCases.deleteProduct.execute).toHaveBeenCalledWith('REF-001');
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('publishProduct should publish product', async () => {
    const req = mockReq({ params: { ref: 'REF-001' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.publishProduct.execute as any).mockResolvedValue({ ref: 'REF-001', publicado: true });

    await publishProduct(req, res);

    expect(catalogUseCases.publishProduct.execute).toHaveBeenCalledWith('REF-001');
    expect(res.json).toHaveBeenCalled();
  });

  it('unpublishProduct should unpublish product', async () => {
    const req = mockReq({ params: { ref: 'REF-001' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.unpublishProduct.execute as any).mockResolvedValue({ ref: 'REF-001', publicado: false });

    await unpublishProduct(req, res);

    expect(catalogUseCases.unpublishProduct.execute).toHaveBeenCalledWith('REF-001');
    expect(res.json).toHaveBeenCalled();
  });

  it('listCategories should return categories', async () => {
    const req = mockReq();
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.getCategories.execute as any).mockResolvedValue({
      data: [{ id: '1', nombre: 'Camisetas' }],
      meta: { total: 1, page: 1, limit: 50 },
    });

    await listCategories(req, res);

    expect(catalogUseCases.getCategories.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('createCategory should create category', async () => {
    const req = mockReq({ body: { nombre: 'Camisetas', slug: 'camisetas' } });
    const res = mockRes();
    const { catalogUseCases } = await import('@/modules/catalog/infrastructure/container/catalogContainer');
    (catalogUseCases.createCategory.execute as any).mockResolvedValue({ id: '1', nombre: 'Camisetas', slug: 'camisetas' });

    await createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});
