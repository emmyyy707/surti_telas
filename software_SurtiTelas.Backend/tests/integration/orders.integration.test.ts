import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Orders Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should list orders with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.totalRecords).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(401);
  });
});
