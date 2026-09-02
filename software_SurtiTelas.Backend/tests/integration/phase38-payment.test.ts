import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';
import { prisma } from '@/config/database';

describe('Admin payment confirmation (FASE 38)', () => {
  let app: any;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('PATCH /admin/custom-orders/:id/payment accepts anticipoPagado + paymentStatus APPROVED', async () => {
    const created = await request(app)
      .post('/api/v1/custom-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteNombre: 'Fase 38 Pago',
        clienteEmail: 'fase38pago@test.com',
        items: [{ descripcion: 'Item test pago', tipoPersonalizacion: 'BORDADO_ESTAMPADO', cantidad: 4, distribucionTallas: { S: 2, M: 2 } }],
      });
    expect(created.status).toBe(201);
    const oid = created.body.data.id;

    await prisma.custom_orders.update({
      where: { id: oid },
      data: { estado: 'PAGO_EN_VERIFICACION' },
    });

    const r = await request(app)
      .patch(`/api/v1/admin/custom-orders/${oid}/payment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ anticipoPagado: true, paymentStatus: 'APPROVED' });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.estado).toBe('CONVERTIDO_A_PEDIDO');
    expect(r.body.data.anticipoPagado).toBe(true);
    expect(r.body.data.paymentStatus).toBe('APPROVED');
  });

  it('PATCH /admin/custom-orders/:id/payment rejects blob: paymentProofUrl and ignores it', async () => {
    const created = await request(app)
      .post('/api/v1/custom-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteNombre: 'Fase 38 BlobProof',
        clienteEmail: 'fase38blob@test.com',
        items: [{ descripcion: 'Item test blob', tipoPersonalizacion: 'BORDADO_ESTAMPADO', cantidad: 1, distribucionTallas: { S: 1 } }],
      });
    const oid = created.body.data.id;
    await prisma.custom_orders.update({
      where: { id: oid },
      data: { estado: 'PAGO_EN_VERIFICACION' },
    });

    const r = await request(app)
      .patch(`/api/v1/admin/custom-orders/${oid}/payment`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        anticipoPagado: true,
        paymentStatus: 'APPROVED',
        paymentProofUrl: 'blob:http://localhost:5173/invalid',
      });
    expect(r.status).toBe(200);
    expect(r.body.data.paymentProofUrl).toBeNull();
  });
});

describe('Blob URL sanitization (FASE 38)', () => {
  let app: any;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('filters blob: URLs on create and read', async () => {
    const created = await request(app)
      .post('/api/v1/custom-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteNombre: 'Fase 38 Blob Filter',
        clienteEmail: 'fase38filter@test.com',
        items: [
          {
            descripcion: 'Item con blob',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 2,
            distribucionTallas: { S: 1, M: 1 },
            imagenesReferencia: ['blob:http://localhost:5173/aaa', 'https://real.test/img.png'],
            personalizaciones: [
              {
                tipo: 'ESTAMPADO',
                descripcion: 'test',
                archivos: ['blob:http://localhost:5173/bbb', '/uploads/custom-orders/refs/ok.png'],
                variantes: [],
              },
            ],
          },
        ],
      });
    expect(created.status).toBe(201);
    const oid = created.body.data.id;

    await prisma.custom_orders.update({
      where: { id: oid },
      data: { payment_proof_url: 'blob:http://localhost:5173/ccc' },
    });

    const fetched = await request(app)
      .get(`/api/v1/custom-orders/${oid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(fetched.status).toBe(200);
    const data = fetched.body.data;
    expect(data.items[0].imagenesReferencia).toEqual(['https://real.test/img.png']);
    expect(data.items[0].personalizaciones[0].archivos).toEqual(['/uploads/custom-orders/refs/ok.png']);
    expect(data.paymentProofUrl).toBeNull();
  });
});
