import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken, ensureAdminExists } from './helpers/auth';

describe('Auth Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = createApp();
    await ensureAdminExists();
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@surtitelas.com',
        password: 'SurtiTelas2025*',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
    const cookies = response.headers['set-cookie'] as string[];
    expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);
    expect(response.body.data.user.email).toBe('admin@surtitelas.com');
    expect(response.body.data.user.role).toBe('ADMIN');
  });

  it('should get current user profile', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('admin@surtitelas.com');
  });

  it('should list users (admin only)', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .get('/api/v1/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.totalRecords).toBeDefined();
  });

  it('should list permissions (admin only)', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .get('/api/v1/auth/permissions')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.totalRecords).toBeDefined();
  });

  it('should request password reset (forgot-password)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'admin@surtitelas.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Si el correo existe');
  });

  it('should change password for authenticated user', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'SurtiTelas2025*',
        newPassword: 'NuevaPass123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Contraseña actualizada');
  });

  it('should reject wrong current password on change-password', async () => {
    const token = await getAuthToken(app);

    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'WrongPassword123!',
        newPassword: 'NuevaPass123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
