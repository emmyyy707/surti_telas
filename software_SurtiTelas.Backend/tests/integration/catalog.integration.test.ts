import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Catalog Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = createApp();
  });

  it('should create a product (admin)', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .post('/api/v1/catalog/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Camiseta Test Integración',
        categoria: 'Camisetas',
        precio: 30000,
        cantidadStock: 50,
        stock: 'OK',
        publicado: false,
        tela: 'Algodón',
        colores: ['Rojo'],
        tallas: ['M'],
        imagenes: [],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nombre).toBe('Camiseta Test Integración');
  });

  it('should publish a product', async () => {
    const token = await getAuthToken(app);
    const uniqueRef = `REF-INT-${Date.now()}`;

    const createResponse = await request(app)
      .post('/api/v1/catalog/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ref: uniqueRef,
        nombre: 'Camiseta Test Publicar',
        categoria: 'Camisetas',
        precio: 30000,
        cantidadStock: 50,
        stock: 'OK',
        publicado: false,
        tela: 'Algodón',
        colores: ['Rojo'],
        tallas: ['M'],
        imagenes: [],
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .post(`/api/v1/catalog/products/${uniqueRef}/publish`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should list products with pagination', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .get('/api/v1/catalog/products')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.meta).toBeDefined();
  });

  it('should list categories', async () => {
    const response = await request(app).get('/api/v1/catalog/categories');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
