import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Custom Orders Integration', () => {
  let app: Express;
  let token: string;
  let createdOrderId: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should create a custom order', async () => {
    const response = await request(app)
      .post('/api/v1/custom-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteNombre: 'Cliente Test',
        clienteEmail: 'cliente@test.com',
        items: [
          {
            descripcion: 'Camiseta test',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 5,
            distribucionTallas: { S: 2, M: 3 },
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.estado).toBe('PENDIENTE');
    createdOrderId = response.body.data.id;
  });

  it('should get custom order by id', async () => {
    const response = await request(app)
      .get(`/api/v1/custom-orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(createdOrderId);
  });

  it('should list custom orders', async () => {
    const response = await request(app)
      .get('/api/v1/custom-orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('should update custom order status from PENDIENTE to ACEPTADO', async () => {
    const response = await request(app)
      .patch(`/api/v1/custom-orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'ACEPTADO' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.estado).toBe('ACEPTADO');
  });

  it('should reject invalid status transition', async () => {
    const response = await request(app)
      .patch(`/api/v1/custom-orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'PAGO_PENDIENTE' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/No se puede cambiar el estado/);
    expect(response.body.data.estado).toBe('ACEPTADO');
  });

  it('should get custom order history', async () => {
    const response = await request(app)
      .get(`/api/v1/custom-orders/${createdOrderId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].estadoAnterior).toBe('PENDIENTE');
    expect(response.body.data[0].estadoNuevo).toBe('ACEPTADO');
  });

  it('should get custom order metrics', async () => {
    const response = await request(app)
      .get('/api/v1/admin/custom-orders/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBeGreaterThanOrEqual(1);
  });
});
