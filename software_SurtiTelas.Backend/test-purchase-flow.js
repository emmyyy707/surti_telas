const request = require('supertest');
const { createApp } = require('./src/config/app');

(async () => {
  const app = createApp();

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@surtitelas.com', password: 'SurtiTelas2025*' });

  console.log('Login status:', loginRes.status);
  const token = loginRes.body?.data?.accessToken;
  if (!token) {
    console.log('No token');
    process.exit(1);
  }

  const supplierRes = await request(app)
    .get('/api/v1/stock/suppliers')
    .set('Authorization', `Bearer ${token}`)
    .query({ limit: 1 });

  console.log('Suppliers status:', supplierRes.status);
  const supplierId = supplierRes.body?.data?.items?.[0]?.id;
  console.log('Supplier ID:', supplierId);

  if (!supplierId) {
    console.log('No suppliers');
    process.exit(1);
  }

  const insumoRes = await request(app)
    .get('/api/v1/stock/raw-materials')
    .set('Authorization', `Bearer ${token}`)
    .query({ limit: 1 });

  console.log('Insumos status:', insumoRes.status);
  const insumo = insumoRes.body?.data?.items?.[0];
  console.log('Insumo:', JSON.stringify(insumo));

  if (!insumo) {
    console.log('No insumos');
    process.exit(1);
  }

  const createRes = await request(app)
    .post('/api/v1/purchases')
    .set('Authorization', `Bearer ${token}`)
    .send({
      numero: 'COMP-TEST-' + Date.now(),
      proveedorId: supplierId,
      usuarioId: 'system',
      total: 1000,
      observaciones: 'Test',
      items: [
        {
          rawMaterialId: insumo.id,
          nombre: insumo.nombre,
          cantidad: 2,
          precioUnitario: 500,
        },
      ],
    });

  console.log('Create purchase status:', createRes.status);
  console.log('Create purchase body:', JSON.stringify(createRes.body, null, 2));

  if (createRes.body?.data?.id) {
    const pdfRes = await request(app)
      .get(`/api/v1/purchases/${createRes.body.data.id}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    console.log('PDF status:', pdfRes.status);
    console.log('PDF content-type:', pdfRes.headers['content-type']);
    console.log('PDF length:', Buffer.byteLength(pdfRes.body || pdfRes.text || '', 'binary'));
    const fs = require('fs');
    fs.writeFileSync('C:\\Users\\usuario\\AppData\\Local\\Temp\\kilo\\compra-test.pdf', Buffer.from(pdfRes.body));
    console.log('PDF saved to temp');
  }
})();
