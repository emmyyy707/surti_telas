import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';

const app = createApp();

describe('API Contract Tests', () => {
  describe('Orders', () => {
    it('GET /api/v1/orders/:id should return 401 without auth', async () => {
      const response = await request(app).get('/api/v1/orders/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Stock - Suppliers', () => {
    it('GET /api/v1/stock/suppliers should return 401 without auth', async () => {
      const response = await request(app).get('/api/v1/stock/suppliers').query({ page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Stock - Raw Materials', () => {
    it('GET /api/v1/stock/raw-materials should return 401 without auth', async () => {
      const response = await request(app).get('/api/v1/stock/raw-materials').query({ page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Production - Workshops', () => {
    it('GET /api/v1/production/workshops should return 401 without auth', async () => {
      const response = await request(app).get('/api/v1/production/workshops').query({ page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Production - Orders', () => {
    it('GET /api/v1/production/orders should return 401 without auth', async () => {
      const response = await request(app).get('/api/v1/production/orders').query({ page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Auth', () => {
    it('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@surtitelas.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
