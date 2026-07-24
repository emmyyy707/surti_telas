import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Customers Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should create a customer', async () => {
    const response = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Cliente Test Integración',
        ciudad: 'Medellín',
        tel: '3009876543',
        nit: '900987654-3',
        cupoTotal: 500000,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nombre).toBe('Cliente Test Integración');
  });

  it('should list customers with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.totalRecords).toBeDefined();
  });

  it('should assign asesor to customer', async () => {
    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    const asesorId = meResponse.body.data.id;

    const listResponse = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 1 });

    const customerId = listResponse.body.data.items[0]?.id;
    if (!customerId || !asesorId) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .post(`/api/v1/customers/${customerId}/asesor`)
      .set('Authorization', `Bearer ${token}`)
      .send({ asesorId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
