import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { getAuthToken } from './helpers/auth';

describe('Deliveries Ruta del Día Integration', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = createApp();
    token = await getAuthToken(app);
  });

  it('should return customer address in ruta-del-dia', async () => {
    const customerResponse = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Cliente Ruta',
        apellidos: 'Dirección',
        telefono: '3001112222',
        nit: '111222333',
        direccion: 'Calle 45 # 12-30',
        ciudad: 'Bogotá',
        estado: 'Activo',
      });

    expect(customerResponse.status).toBe(201);
    const customerId = customerResponse.body.data.id;

    const orderResponse = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: customerId,
        tipoFlujo: 'PRODUCCION',
        itemsList: [
          { nombre: 'Producto Ruta', precio: 5000, cantidad: 1 },
        ],
        prioridad: 'Estándar',
      });

    expect(orderResponse.status).toBe(201);
    const orderId = orderResponse.body.data.id;

    const deliveryResponse = await request(app)
      .post('/api/v1/deliveries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        direccion: '',
        ciudad: '',
        telefono: '',
        notas: 'Test ruta',
      });

    expect(deliveryResponse.status).toBe(201);
    const deliveryId = deliveryResponse.body.data.id;

    const rutaResponse = await request(app)
      .get('/api/v1/deliveries/ruta-del-dia')
      .set('Authorization', `Bearer ${token}`);

    expect(rutaResponse.status).toBe(200);
    expect(rutaResponse.body.success).toBe(true);
    
    const item = rutaResponse.body.data.find((d: any) => d.id === deliveryId);
    expect(item).toBeDefined();
    console.log('RUTA_ITEM', JSON.stringify(item, null, 2));
    expect(item.order.direccion).toBe('Calle 45 # 12-30');
    expect(item.direccion).toBe('Calle 45 # 12-30');
  });
});
