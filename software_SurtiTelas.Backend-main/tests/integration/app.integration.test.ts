import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';

vi.mock('@/shared/infrastructure/healthCheck', () => ({
  getHealthStatus: vi.fn().mockResolvedValue({
    status: 'healthy',
    checks: {
      database: { status: 'healthy', latencyMs: 1 },
      redis: { status: 'healthy', latencyMs: 1 },
      memory: { status: 'healthy', heapUsedMb: 100 },
      eventLoop: { status: 'healthy', lagMs: 1 },
    },
    timestamp: new Date().toISOString(),
  }),
}));

describe('Integration Tests', () => {
  const app = createApp();

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });
  });

  describe('Catalog - Public endpoints', () => {
    it('should list products with pagination format', async () => {
      const response = await request(app)
        .get('/api/v1/catalog/products')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
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

  describe('Auth - Public endpoints', () => {
    it('should return 401 for protected endpoints without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for /orders without token', async () => {
      const response = await request(app).get('/api/v1/orders');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Swagger docs', () => {
    it('should serve swagger UI or redirect', async () => {
      const response = await request(app).get('/api/docs');

      expect([200, 301]).toContain(response.status);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/v1/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('not_found');
    });
  });
});
