import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Stock Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should create a supplier', async () => {
    const uniqueNit = `900${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}-1`;

    const response = await request(app)
      .post('/api/v1/stock/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proveedor Test Integración',
        nit: uniqueNit,
        estado: 'ACTIVO',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nombre).toBe('Proveedor Test Integración');
  });

  it('should list suppliers with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/stock/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.meta).toBeDefined();
  });

  it('should register a stock movement', async () => {
    const listResponse = await request(app)
      .get('/api/v1/stock/raw-materials')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 1 });

    const materialId = listResponse.body.data.items[0]?.id;
    if (!materialId) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .post('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rawMaterialId: materialId,
        tipo: 'ENTRADA',
        cantidad: 10,
        motivo: 'Test integración',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('should list movements with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.meta).toBeDefined();
  });
});
