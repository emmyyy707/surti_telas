import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Production Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should create a workshop', async () => {
    const response = await request(app)
      .post('/api/v1/production/workshops')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Taller Test Integración',
        estado: 'ACTIVO',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nombre).toBe('Taller Test Integración');
  });

  it('should list workshops with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/production/workshops')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.meta).toBeDefined();
  });

  it('should create a production order', async () => {
    const response = await request(app)
      .post('/api/v1/production/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        referencia: 'PROD-INT-001',
        cantidad: 100,
        fechaEstimada: '2025-12-31',
        colores: ['Rojo'],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.referencia).toBe('PROD-INT-001');
  });

  it('should update a workshop', async () => {
    const createResponse = await request(app)
      .post('/api/v1/production/workshops')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Taller Actualizar',
        estado: 'ACTIVO',
      });

    expect(createResponse.status).toBe(201);
    const workshopId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .patch(`/api/v1/production/workshops/${workshopId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Taller Actualizado',
        capacidad: 50,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.nombre).toBe('Taller Actualizado');
    expect(updateResponse.body.data.capacidad).toBe(50);
    expect(updateResponse.body.data.id).toBe(workshopId);
  });
});
