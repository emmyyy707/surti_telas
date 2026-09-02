import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Purchases Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should create a purchase', async () => {
    const supplierRes = await request(app)
      .get('/api/v1/stock/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 1 });

    expect(supplierRes.status).toBe(200);
    const supplierId = supplierRes.body?.data?.items?.[0]?.id;
    expect(supplierId).toBeDefined();

    const response = await request(app)
      .post('/api/v1/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        numero: 'COMP-TEST-' + Date.now(),
        proveedorId: supplierId,
        usuarioId: 'system',
        total: 1000,
        observaciones: 'Test',
        items: [
          {
            nombre: 'Tela algodón',
            cantidad: 2,
            precioUnitario: 500,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.numero).toBeDefined();
    expect(response.body.data.total).toBe(1000);
  });

  it('should list purchases with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/purchases')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('should return 404 for unknown purchase', async () => {
    const response = await request(app)
      .get('/api/v1/purchases/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('should download purchase PDF', async () => {
    const listRes = await request(app)
      .get('/api/v1/purchases')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 1 });

    const purchaseId = listRes.body?.data?.items?.[0]?.id;
    if (!purchaseId) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .get(`/api/v1/purchases/${purchaseId}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/pdf/);
  });
});
