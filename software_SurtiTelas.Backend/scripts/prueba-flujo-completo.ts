const BASE = 'http://localhost:3000/api/v1';

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Login failed: ${JSON.stringify(json)}`);
  return json.data.accessToken;
}

async function createOrder(token: string): Promise<any> {
  const res = await fetch(`${BASE}/custom-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      clienteNombre: 'Cliente Prueba',
      clienteEmail: 'clientetest@surtitelas.com',
      clienteTelefono: '3001234567',
      descripcionGeneral: 'Pedido prueba flujo cotizaciones',
      usoFinal: 'VENTA',
      direccionEntrega: 'Calle 123',
      fechaEntregaDeseada: '2026-12-31T00:00:00.000Z',
      items: [
        {
          productoNombre: 'Camiseta personalizada',
          descripcion: 'Camiseta de prueba',
          tipoPersonalizacion: 'BORDADO_ESTAMPADO',
          cantidad: 10,
          material: 'Algodon',
          talla: 'M',
          color: 'Blanco',
          especificaciones: 'Prueba',
          personalizaciones: [
            {
              tipo: 'ESTAMPADO',
              tecnica: 'DTF',
              descripcion: 'Logo en espalda',
              ubicacion: ['ESPALDA'],
            },
          ],
        },
      ],
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Create order failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function getOrder(token: string, id: string): Promise<any> {
  const res = await fetch(`${BASE}/custom-orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Get order failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function generateQuotation(token: string, id: string): Promise<any> {
  const res = await fetch(`${BASE}/admin/custom-orders/${id}/quotation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subtotal: 250000,
      impuestos: 47500,
      descuento: 0,
      tiempoEstimadoDias: 5,
      validaHasta: '2026-08-26T00:00:00.000Z',
      condicionesPago: '50% anticipo, 50% contraentrega',
      observaciones: 'Cotización de prueba',
      generadoPorId: 'admin',
      generadoPorNombre: 'Admin Prueba',
      detalles: [
        {
          tipo: 'PRODUCTO_BASE',
          descripcion: 'Camiseta base Algodón',
          cantidad: 10,
          unidadMedida: 'UND',
          precioUnitario: 25000,
          subtotal: 250000,
          orden: 0,
        },
      ],
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Generate quotation failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function acceptQuotation(token: string, id: string): Promise<any> {
  const res = await fetch(`${BASE}/custom-orders/${id}/accept-quotation`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ confirmacion: 'acepto' }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Accept quotation failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function rejectQuotation(token: string, id: string): Promise<any> {
  const res = await fetch(`${BASE}/custom-orders/${id}/reject-quotation`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ motivoRechazo: 'No me convence el precio' }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Reject quotation failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function main() {
  const clientEmail = 'clientetest@surtitelas.com';
  const clientPassword = 'ClienteTest123!';
  const adminEmail = 'admintest@surtitelas.com';
  const adminPassword = 'AdminTest123!';

  console.log('=== LOGIN CLIENTE ===');
  const clientToken = await login(clientEmail, clientPassword);
  console.log('CLIENTE token OK');

  console.log('=== CREAR SOLICITUD 1 ===');
  const order1 = await createOrder(clientToken);
  console.log('Solicitud 1 creada:', order1.id, order1.numeroSolicitud, 'estado:', order1.estado);
  if (order1.estado !== 'PENDIENTE') throw new Error(`Se esperaba PENDIENTE, se obtuvo ${order1.estado}`);

  console.log('=== GENERAR COTIZACIÓN 1 ===');
  const adminToken = await login(adminEmail, adminPassword);
  console.log('ADMIN token OK');
  const quote1 = await generateQuotation(adminToken, order1.id);
  console.log('Cotización 1 generada:', quote1.numero, 'estado:', quote1.estado, 'negotiationCount:', quote1.negotiationCount);

  const order1AfterQuote = await getOrder(clientToken, order1.id);
  console.log('Solicitud 1 después de cotizar:', order1AfterQuote.estado);
  console.log('Cotización en solicitud 1:', order1AfterQuote.cotizacion?.estado, 'negotiationCount:', order1AfterQuote.cotizacion?.negotiationCount);

  if (order1AfterQuote.estado !== 'COTIZADO') throw new Error(`Se esperaba COTIZADO, se obtuvo ${order1AfterQuote.estado}`);
  if (order1AfterQuote.cotizacion?.estado !== 'ENVIADA') throw new Error(`Se esperaba ENVIADA, se obtuvo ${order1AfterQuote.cotizacion?.estado}`);
  if (order1AfterQuote.cotizacion?.negotiationCount !== 0) throw new Error(`Se esperaba negotiationCount 0, se obtuvo ${order1AfterQuote.cotizacion?.negotiationCount}`);

  console.log('=== VER DETALLE CLIENTE SOLICITUD 1 ===');
  const detail1 = await getOrder(clientToken, order1.id);
  const hasQuotationSection = detail1.cotizacion && detail1.cotizacion.estado === 'ENVIADA';
  const hasNegotiations = detail1.cotizacion && detail1.cotizacion.negotiationCount !== undefined;
  console.log('Tiene sección cotización:', hasQuotationSection);
  console.log('Tiene negociaciones:', hasNegotiations, detail1.cotizacion?.negotiationCount);
  console.log('Conceptos:', detail1.cotizacion?.detalles?.length);
  console.log('Subtotal:', detail1.cotizacion?.subtotal);
  console.log('Total:', detail1.cotizacion?.total);
  console.log('Condiciones:', detail1.cotizacion?.condicionesPago);

  console.log('=== ACEPTAR COTIZACIÓN 1 ===');
  const accepted1 = await acceptQuotation(clientToken, order1.id);
  console.log('Aceptada:', accepted1.id, accepted1.estado);
  if (accepted1.estado !== 'PAGO_PENDIENTE') throw new Error(`Se esperaba PAGO_PENDIENTE, se obtuvo ${accepted1.estado}`);

  const detail1AfterAccept = await getOrder(clientToken, order1.id);
  console.log('Después de aceptar - estado:', detail1AfterAccept.estado);
  console.log('Después de aceptar - cotización estado:', detail1AfterAccept.cotizacion?.estado);

  console.log('=== CREAR SOLICITUD 2 ===');
  const order2 = await createOrder(clientToken);
  console.log('Solicitud 2 creada:', order2.id, order2.numeroSolicitud, 'estado:', order2.estado);
  if (order2.estado !== 'PENDIENTE') throw new Error(`Se esperaba PENDIENTE, se obtuvo ${order2.estado}`);

  const quote2 = await generateQuotation(adminToken, order2.id);
  console.log('Cotización 2 generada:', quote2.numero, 'estado:', quote2.estado, 'negotiationCount:', quote2.negotiationCount);

  const order2AfterQuote = await getOrder(clientToken, order2.id);
  if (order2AfterQuote.estado !== 'COTIZADO') throw new Error(`Se esperaba COTIZADO, se obtuvo ${order2AfterQuote.estado}`);
  if (order2AfterQuote.cotizacion?.estado !== 'ENVIADA') throw new Error(`Se esperaba ENVIADA, se obtuvo ${order2AfterQuote.cotizacion?.estado}`);
  if (order2AfterQuote.cotizacion?.negotiationCount !== 0) throw new Error(`Se esperaba negotiationCount 0, se obtuvo ${order2AfterQuote.cotizacion?.negotiationCount}`);

  console.log('=== RECHAZAR COTIZACIÓN 2 ===');
  const rejected2 = await rejectQuotation(clientToken, order2.id);
  console.log('Rechazada:', rejected2.id, rejected2.estado);
  if (rejected2.estado !== 'COTIZACION_RECHAZADA') throw new Error(`Se esperaba COTIZACION_RECHAZADA, se obtuvo ${rejected2.estado}`);

  const detail2AfterReject = await getOrder(clientToken, order2.id);
  console.log('Después de rechazar - estado:', detail2AfterReject.estado);
  console.log('Después de rechazar - cotización estado:', detail2AfterReject.cotizacion?.estado);
  console.log('Después de rechazar - negotiationCount:', detail2AfterReject.cotizacion?.negotiationCount);

  if (detail2AfterReject.estado !== 'COTIZACION_RECHAZADA') throw new Error(`Se esperaba COTIZACION_RECHAZADA, se obtuvo ${detail2AfterReject.estado}`);
  if (detail2AfterReject.cotizacion?.estado !== 'PENDIENTE') throw new Error(`Se esperaba PENDIENTE, se obtuvo ${detail2AfterReject.cotizacion?.estado}`);
  if (detail2AfterReject.cotizacion?.negotiationCount !== 1) throw new Error(`Se esperaba negotiationCount 1, se obtuvo ${detail2AfterReject.cotizacion?.negotiationCount}`);

  console.log('\n=== PRUEBA COMPLETA OK ===');
  console.log('Solicitud 1:', order1.id, '-> ACEPTADA -> PAGO_PENDIENTE');
  console.log('Solicitud 2:', order2.id, '-> RECHAZADA -> COTIZACION_RECHAZADA, cotización PENDIENTE, negociación 1/3');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
