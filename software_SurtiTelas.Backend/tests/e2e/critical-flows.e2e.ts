import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
let adminToken = '';
let adminUserId = '';
let customerId = '';
let orderId = '';

test.beforeAll(async ({ request }) => {
  const loginResponse = await request.post(`${BASE}/api/v1/auth/login`, {
    data: {
      email: 'admin@surtitelas.com',
      password: 'SurtiTelas2025*',
    },
  });
  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  expect(loginBody.success).toBe(true);
  expect(loginBody.data?.accessToken).toBeDefined();
  adminToken = loginBody.data.accessToken;

  const meResponse = await request.get(`${BASE}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(meResponse.status()).toBe(200);
  const meBody = await meResponse.json();
  adminUserId = meBody.data.id;

  const customerResponse = await request.post(`${BASE}/api/v1/customers`, {
    headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        nombre: 'Cliente E2E',
        telefono: '3000000000',
        nit: '9001234567',
        cupoTotal: 500000,
        cupoUsado: 0,
        deudaVencida: 0,
        isTrustedCustomer: false,
        estado: 'Activo',
      },
  });
  expect(customerResponse.status()).toBe(201);
  const customerBody = await customerResponse.json();
  expect(customerBody.success).toBe(true);
  customerId = customerBody.data.id;
});

test('E2E API - login returns access token', async ({ request }) => {
  const res = await request.post(`${BASE}/api/v1/auth/login`, {
    data: { email: 'admin@surtitelas.com', password: 'SurtiTelas2025*' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data?.accessToken).toBeDefined();
});

test('E2E API - create order and update status', async ({ request }) => {
  const createRes = await request.post(`${BASE}/api/v1/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      clienteId: customerId,
      asesorId: adminUserId,
      itemsList: [{ nombre: 'Producto E2E', cantidad: 1, precio: 1000 }],
    },
  });
  expect(createRes.status()).toBe(201);
  const createJson = await createRes.json();
  expect(createJson.success).toBe(true);
  orderId = createJson.data?.id;
  expect(orderId).toBeDefined();

  const statusRes = await request.patch(`${BASE}/api/v1/orders/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { estado: 'En producción' },
  });
  expect(statusRes.status()).toBe(200);
  const statusJson = await statusRes.json();
  expect(statusJson.success).toBe(true);
  expect(statusJson.data?.estado).toBe('En producción');
});

test('E2E API - create payment and receipt', async ({ request }) => {
  const orderRes = await request.post(`${BASE}/api/v1/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      clienteId: customerId,
      asesorId: adminUserId,
      itemsList: [{ nombre: 'Producto E2E', cantidad: 1, precio: 1000 }],
    },
  });
  expect(orderRes.status()).toBe(201);
  const orderJson = await orderRes.json();
  expect(orderJson.success).toBe(true);
  const localOrderId = orderJson.data?.id;
  expect(localOrderId).toBeDefined();

  const paymentRes = await request.post(`${BASE}/api/v1/payments`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { orderId: localOrderId, customerId: customerId, amount: 5000, method: 'TRANSFER', reference: 'E2E-REF' },
  });
  expect(paymentRes.status()).toBe(201);
  const paymentJson = await paymentRes.json();
  expect(paymentJson.success).toBe(true);
  expect(paymentJson.data?.amount).toBe(5000);

  const receiptRes = await request.post(`${BASE}/api/v1/receipts`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { orderId: localOrderId, customerId: customerId, numero: `REC-E2E-${Date.now()}`, total: 5000, concepto: 'Pago E2E' },
  });
  expect(receiptRes.status()).toBe(201);
  const receiptJson = await receiptRes.json();
  expect(receiptJson.success).toBe(true);
  expect(receiptJson.data?.total).toBe(5000);
});
