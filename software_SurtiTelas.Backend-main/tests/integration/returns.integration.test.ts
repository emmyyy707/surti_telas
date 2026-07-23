import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Returns Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should list returns (paginated)', async () => {
    const res = await request(app)
      .get('/api/v1/returns')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.meta).toBeDefined();
  });

  it('should create, get, update status and delete a return', async () => {
    const ordersRes = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 1 });
    const orderId = ordersRes.body.data?.items?.[0]?.id;
    expect(orderId).toBeDefined();

    const createRes = await request(app)
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        prenda: 'Camiseta de prueba',
        referencia: 'REF-001',
        motivo: 'Cambio de talla',
        cantidad: 2,
        cliente: 'Cliente Prueba',
        responsable: 'Admin',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const id = createRes.body.data.id;
    expect(createRes.body.data.numeroDevolucion).toMatch(/^DEV-\d{4}$/);

    const getRes = await request(app)
      .get(`/api/v1/returns/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(id);

    const statusRes = await request(app)
      .post(`/api/v1/returns/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'EN_INSPECCION' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.estado).toBe('EN_INSPECCION');

    const updateRes = await request(app)
      .patch(`/api/v1/returns/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidadInspeccionada: 2, observaciones: 'Inspeccionada' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.cantidadInspeccionada).toBe(2);

    const delRes = await request(app)
      .delete(`/api/v1/returns/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(204);
  });

  it('should return 404 for unknown return', async () => {
    const res = await request(app)
      .get('/api/v1/returns/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
