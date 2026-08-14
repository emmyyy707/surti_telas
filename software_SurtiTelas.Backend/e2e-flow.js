const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function login(email, password) {
  const data = JSON.stringify({ email, password });
  const res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, data);
  return res.body.data?.accessToken;
}

async function main() {
  const adminToken = await login('admin@surtitelas.com', 'SurtiTelas2025*');
  console.log('Admin login:', adminToken ? 'OK' : 'FAILED');

  // 1. Create custom order as admin
  const createPayload = JSON.stringify({
    clienteNombre: 'Cliente Flujo E2E',
    clienteEmail: 'flujo-e2e@test.com',
    clienteTelefono: '3000000000',
    descripcionGeneral: 'Pedido de prueba end-to-end',
    items: [
      {
        descripcion: 'Pantalonetas',
        tipoPersonalizacion: 'ESTAMPADO',
        cantidad: 500,
        material: 'Licra',
        ubicacion: ['OTRA'],
        personalizaciones: [
          {
            tipo: 'ESTAMPADO',
            descripcion: 'Logo estampado',
            ubicacion: ['OTRA'],
            variantes: [
              { talla: 'M', color: 'Beige', cantidad: 500 }
            ]
          }
        ]
      },
      {
        descripcion: 'Camiseta basica de algodon',
        tipoPersonalizacion: 'BORDADO',
        cantidad: 1000,
        material: 'Algodon',
        ubicacion: ['PECHO'],
        personalizaciones: [
          {
            tipo: 'BORDADO',
            descripcion: 'Bordado pecho',
            ubicacion: ['PECHO'],
            variantes: [
              { talla: 'XS', color: 'Negro', cantidad: 50 },
              { talla: 'XS', color: 'Blanco', cantidad: 50 },
              { talla: 'S', color: 'Negro', cantidad: 100 },
              { talla: 'S', color: 'Blanco', cantidad: 100 },
              { talla: 'M', color: 'Beige', cantidad: 200 },
              { talla: 'L', color: 'Azul celeste', cantidad: 200 },
              { talla: 'XL', color: 'Palo rosa', cantidad: 200 },
              { talla: 'XXL', color: 'Marrón', cantidad: 100 }
            ]
          }
        ]
      }
    ]
  });

  const createRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/custom-orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, createPayload);

  console.log('1. POST /custom-orders:', createRes.status, createRes.body?.message || createRes.body?.error);
  const orderId = createRes.body?.data?.id;
  const orderNumero = createRes.body?.data?.numeroSolicitud;

  if (!orderId) {
    console.log('Failed to create order');
    return;
  }

  // 2. List orders
  const listRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/custom-orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('2. GET /custom-orders:', listRes.status, 'items:', listRes.body?.data?.items?.length || 0);

  // 3. Get order detail
  const getRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('3. GET /custom-orders/:id:', getRes.status, 'items:', getRes.body?.data?.items?.length || 0);

  // 4. Update order
  const updatePayload = JSON.stringify({
    clienteNombre: 'Cliente Flujo E2E Actualizado',
    items: [
      {
        descripcion: 'Pantalonetas EDITADAS',
        tipoPersonalizacion: 'ESTAMPADO',
        cantidad: 600,
        material: 'Licra premium',
        ubicacion: ['PECHO', 'ESPALDA'],
        personalizaciones: [
          {
            tipo: 'ESTAMPADO',
            descripcion: 'Logo actualizado',
            ubicacion: ['ESPALDA'],
            variantes: [
              { talla: 'L', color: 'Negro', cantidad: 300 },
              { talla: 'L', color: 'Blanco', cantidad: 300 }
            ]
          }
        ]
      }
    ]
  });

  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, updatePayload);
  console.log('4. PATCH /custom-orders/:id:', updateRes.status, updateRes.body?.message || updateRes.body?.error);

  // 5. Submit for review
  const submitRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}/submit`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('5. PATCH /custom-orders/:id/submit:', submitRes.status, submitRes.body?.message || submitRes.body?.error);

  // 6. Admin list
  const adminListRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/custom-orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('6. GET /admin/custom-orders:', adminListRes.status, 'items:', adminListRes.body?.data?.items?.length || 0);

  // 7. Admin get detail
  const adminGetRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('7. GET /admin/custom-orders/:id:', adminGetRes.status);

  // 8. Admin update
  const adminUpdatePayload = JSON.stringify({
    clienteNombre: 'Cliente Flujo E2E Admin Edit',
    items: [
      {
        descripcion: 'Pantalonetas ADMIN EDIT',
        tipoPersonalizacion: 'ESTAMPADO',
        cantidad: 700,
        material: 'Licra admin',
        ubicacion: ['PECHO'],
        personalizaciones: [
          {
            tipo: 'ESTAMPADO',
            descripcion: 'Logo admin',
            ubicacion: ['PECHO'],
            variantes: [
              { talla: 'XL', color: 'Rojo', cantidad: 700 }
            ]
          }
        ]
      }
    ]
  });

  const adminUpdateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, adminUpdatePayload);
  console.log('8. PATCH /admin/custom-orders/:id:', adminUpdateRes.status, adminUpdateRes.body?.message || adminUpdateRes.body?.error);

  // 9. Change status to EN_REVISION
  const statusRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, JSON.stringify({ estado: 'EN_REVISION' }));
  console.log('9. PATCH /admin/custom-orders/:id/status:', statusRes.status, statusRes.body?.message || statusRes.body?.error);

  // 10. Generate quotation
  const quotationPayload = JSON.stringify({
    detalles: [
      {
        tipo: 'PRODUCTO_BASE',
        descripcion: 'Pantalonetas',
        cantidad: 700,
        unidadMedida: 'unidad',
        precioUnitario: 15000,
        subtotal: 10500000,
        observaciones: '',
        orden: 0
      },
      {
        tipo: 'MANO_OBRA',
        descripcion: 'Estampado',
        cantidad: 700,
        unidadMedida: 'unidad',
        precioUnitario: 5000,
        subtotal: 3500000,
        observaciones: '',
        orden: 1
      }
    ],
    subtotal: 14000000,
    impuestos: 2660000,
    descuento: 0,
    tiempoEstimadoDias: 15,
    validaHasta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    condicionesPago: '50% anticipo, 50% contra entrega',
    observaciones: 'Cotizacion E2E',
    generadoPorId: adminToken ? 'admin' : undefined,
    generadoPorNombre: 'Administrador'
  });

  const quotationRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/quotation`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, quotationPayload);
  console.log('10. POST /admin/custom-orders/:id/quotation:', quotationRes.status, quotationRes.body?.message || quotationRes.body?.error);

  // 11. Client view quotation
  const clientToken = await login('danielmurilloruiz53@gmail.com', 'SurtiTelas2025*');
  console.log('11. Client login:', clientToken ? 'OK' : 'FAILED');
  const clientDetailRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${clientToken}` },
  });
  console.log('11. Client get detail:', clientDetailRes.status, 'cotizacion:', !!clientDetailRes.body?.data?.cotizacion);

  // 12. Client accept quotation
  const acceptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}/accept-quotation`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${clientToken}` },
  });
  console.log('12. PATCH /custom-orders/:id/accept-quotation:', acceptRes.status, acceptRes.body?.message || acceptRes.body?.error);

  // 13. Client upload payment proof
  const uploadRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/custom-orders/${orderId}/payment-proof`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clientToken}`,
    },
  }, JSON.stringify({}));
  console.log('13. POST /custom-orders/:id/payment-proof:', uploadRes.status, uploadRes.body?.message || uploadRes.body?.error);

  // 14. Admin confirm payment
  const paymentRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/payment`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, JSON.stringify({ anticipoPagado: true, paymentStatus: 'APPROVED' }));
  console.log('14. PATCH /admin/custom-orders/:id/payment:', paymentRes.status, paymentRes.body?.message || paymentRes.body?.error);

  // 15. Convert to order
  const convertRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/convert`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('15. POST /admin/custom-orders/:id/convert:', convertRes.status, convertRes.body?.message || convertRes.body?.error);

  // 16. Second convert should fail
  const convertRes2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/convert`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log('16. Second convert:', convertRes2.status, convertRes2.body?.message || convertRes2.body?.error);
}

main().catch(e => console.error(e));
