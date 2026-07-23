import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
let adminToken = '';
let adminUserId = '';
let customerId = '';
let orderId = '';
let productRef = '';

test.beforeAll(async ({ request }) => {
  const loginResponse = await request.post(`${BASE}/api/v1/auth/login`, {
    data: {
      email: 'admin@surtitelas.com',
      password: 'SurtiTelas2025*',
    },
  });
  const loginBody = await loginResponse.json();
  adminToken = loginBody.data.accessToken;

  const meResponse = await request.get(`${BASE}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const meBody = await meResponse.json();
  adminUserId = meBody.data.id;
});

test.describe('E2E - Contract: Product', () => {
  test('GET /api/v1/catalog/products should match Product list contract', async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/catalog/products?page=1&limit=10`);
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.items).toBeDefined();
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.meta).toBeDefined();
    expect(body.data.meta.totalRecords).toBeDefined();
    expect(body.data.meta.page).toBeDefined();
    expect(body.data.meta.limit).toBeDefined();
    expect(body.data.meta.totalPages).toBeDefined();

    if (body.data.items.length > 0) {
      const product = body.data.items[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('ref');
      expect(product).toHaveProperty('nombre');
      expect(product).toHaveProperty('precio');
      expect(product).toHaveProperty('cantidadStock');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('publicado');
      expect(product).toHaveProperty('tela');
      expect(product).toHaveProperty('colores');
      expect(product).toHaveProperty('tallas');
      expect(product).toHaveProperty('imagenes');
      expect(typeof product.id).toBe('string');
      expect(typeof product.ref).toBe('string');
      expect(typeof product.nombre).toBe('string');
      expect(typeof product.precio).toBe('number');
      expect(typeof product.cantidadStock).toBe('number');
      expect(['OK', 'Bajo stock', 'Agotado']).toContain(product.stock);
      expect(typeof product.publicado).toBe('boolean');
      expect(typeof product.tela).toBe('string');
      expect(Array.isArray(product.colores)).toBe(true);
      expect(Array.isArray(product.tallas)).toBe(true);
      expect(Array.isArray(product.imagenes)).toBe(true);
    }
  });

  test('POST /api/v1/catalog/products should return created Product contract', async ({ request }) => {
    const ref = `REF-E2E-${Date.now()}`;
    const response = await request.post(`${BASE}/api/v1/catalog/products`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: {
        ref,
        nombre: 'Producto E2E',
        categoria: 'Camisetas',
        precio: 10000,
        cantidadStock: 10,
        stock: 'OK',
        estado: 'Activo',
        tela: 'Algodón',
        colores: ['Blanco'],
        tallas: ['M'],
        imagenes: [],
        publicado: true,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.ref).toBe(ref);

    const product = body.data;
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('ref');
    expect(product).toHaveProperty('nombre');
    expect(product).toHaveProperty('categoria');
    expect(product).toHaveProperty('precio');
    expect(product).toHaveProperty('cantidadStock');
    expect(product).toHaveProperty('stock');
    expect(product).toHaveProperty('publicado');
    expect(product).toHaveProperty('tela');
    expect(product).toHaveProperty('colores');
    expect(product).toHaveProperty('tallas');
    expect(product).toHaveProperty('imagenes');
    expect(typeof product.id).toBe('string');
    expect(typeof product.ref).toBe('string');
    expect(typeof product.nombre).toBe('string');
    expect(typeof product.categoria).toBe('string');
    expect(typeof product.precio).toBe('number');
    expect(typeof product.cantidadStock).toBe('number');
    expect(['OK', 'Bajo stock', 'Agotado']).toContain(product.stock);
    expect(typeof product.publicado).toBe('boolean');
    expect(typeof product.tela).toBe('string');
    expect(Array.isArray(product.colores)).toBe(true);
    expect(Array.isArray(product.tallas)).toBe(true);
    expect(Array.isArray(product.imagenes)).toBe(true);

    productRef = product.ref;
  });

  test('GET /api/v1/catalog/products/:ref should match Product detail contract', async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/catalog/products/${productRef}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.ref).toBe(productRef);
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('nombre');
    expect(body.data).toHaveProperty('precio');
    expect(body.data).toHaveProperty('cantidadStock');
    expect(body.data).toHaveProperty('stock');
    expect(body.data).toHaveProperty('publicado');
    expect(body.data).toHaveProperty('tela');
    expect(body.data).toHaveProperty('colores');
    expect(body.data).toHaveProperty('tallas');
    expect(body.data).toHaveProperty('imagenes');
  });
});

test.describe('E2E - Contract: Order', () => {
  test('should create a customer', async ({ request }) => {
    const response = await request.post(`${BASE}/api/v1/customers`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
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

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    customerId = body.data.id;
  });

  test('POST /api/v1/orders should return created Order contract', async ({ request }) => {
    const createResponse = await request.post(`${BASE}/api/v1/orders`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: {
        clienteId: customerId,
        asesorId: adminUserId,
        itemsList: [
          {
            nombre: 'Camiseta E2E',
            precio: 10000,
            cantidad: 2,
          },
        ],
        prioridad: 'Estándar',
        observaciones: 'Pedido de prueba E2E',
      },
    });

    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.success).toBe(true);
    expect(createBody.data.id).toBeDefined();
    orderId = createBody.data.id;

    const order = createBody.data;
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('numero');
    expect(order).toHaveProperty('cliente');
    expect(order).toHaveProperty('asesor');
    expect(order).toHaveProperty('fecha');
    expect(order).toHaveProperty('items');
    expect(order).toHaveProperty('total');
    expect(order).toHaveProperty('estado');
    expect(order).toHaveProperty('itemsList');
    expect(order).toHaveProperty('createdAt');
    expect(order).toHaveProperty('updatedAt');
    expect(typeof order.id).toBe('string');
    expect(typeof order.numero).toBe('string');
    expect(typeof order.cliente).toBe('string');
    expect(typeof order.asesor).toBe('string');
    expect(typeof order.fecha).toBe('string');
    expect(typeof order.items).toBe('number');
    expect(typeof order.total).toBe('number');
    expect(typeof order.estado).toBe('string');
    expect(Array.isArray(order.itemsList)).toBe(true);
    expect(order.itemsList.length).toBeGreaterThan(0);
    expect(order.itemsList[0]).toHaveProperty('nombre');
    expect(order.itemsList[0]).toHaveProperty('precio');
    expect(order.itemsList[0]).toHaveProperty('cantidad');
    expect(typeof order.itemsList[0].nombre).toBe('string');
    expect(typeof order.itemsList[0].precio).toBe('number');
    expect(typeof order.itemsList[0].cantidad).toBe('number');
  });

  test('GET /api/v1/orders should match Order list contract', async ({ request }) => {
    const listResponse = await request.get(`${BASE}/api/v1/orders`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.success).toBe(true);
    expect(listBody.data).toBeDefined();
    expect(listBody.data.items).toBeDefined();
    expect(Array.isArray(listBody.data.items)).toBe(true);
    expect(listBody.data.meta).toBeDefined();
    expect(listBody.data.meta.totalRecords).toBeDefined();
    expect(listBody.data.meta.page).toBeDefined();
    expect(listBody.data.meta.limit).toBeDefined();
    expect(listBody.data.meta.totalPages).toBeDefined();
  });

  test('GET /api/v1/orders/:id should match Order detail contract', async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(orderId);
    expect(body.data).toHaveProperty('numero');
    expect(body.data).toHaveProperty('cliente');
    expect(body.data).toHaveProperty('asesor');
    expect(body.data).toHaveProperty('fecha');
    expect(body.data).toHaveProperty('items');
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('estado');
    expect(body.data).toHaveProperty('itemsList');
    expect(body.data).toHaveProperty('createdAt');
    expect(body.data).toHaveProperty('updatedAt');
    expect(Array.isArray(body.data.itemsList)).toBe(true);
    expect(body.data.itemsList[0]).toHaveProperty('nombre');
    expect(body.data.itemsList[0]).toHaveProperty('precio');
    expect(body.data.itemsList[0]).toHaveProperty('cantidad');
  });

  test('PATCH /api/v1/orders/:id/status should return Order contract after transition', async ({ request }) => {
    const statusResponse = await request.patch(`${BASE}/api/v1/orders/${orderId}/status`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: {
        estado: 'En producción',
      },
    });

    expect(statusResponse.status()).toBe(200);
    const statusBody = await statusResponse.json();
    expect(statusBody.success).toBe(true);
    expect(statusBody.data.estado).toBe('En producción');
    expect(statusBody.data).toHaveProperty('id');
    expect(statusBody.data).toHaveProperty('itemsList');
  });
});
