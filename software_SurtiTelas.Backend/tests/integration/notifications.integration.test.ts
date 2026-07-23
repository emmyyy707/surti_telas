import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Notifications Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should list notifications with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.meta).toBeDefined();
  });
});
