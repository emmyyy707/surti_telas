import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test('E2E smoke - health check', async ({ request }) => {
  const res = await request.get(`${BASE}/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data?.status).toBe('healthy');
});

test('E2E smoke - login returns token', async ({ request }) => {
  const res = await request.post(`${BASE}/api/v1/auth/login`, {
    data: { email: 'admin@surtitelas.com', password: 'SurtiTelas2025*' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data?.accessToken).toBeDefined();
});

test('E2E smoke - list orders with token', async ({ request }) => {
  const login = await request.post(`${BASE}/api/v1/auth/login`, {
    data: { email: 'admin@surtitelas.com', password: 'SurtiTelas2025*' },
  });
  const loginBody = await login.json();
  const token = loginBody.data.accessToken;

  const res = await request.get(`${BASE}/api/v1/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data).toBeDefined();
  expect(body.data.items).toBeDefined();
  expect(Array.isArray(body.data.items)).toBe(true);
  expect(body.data.meta).toBeDefined();
  expect(body.data.meta.totalRecords).toBeDefined();
});
