import { PrismaClient } from '@prisma/client';
import { PrismaCustomOrderRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository';
import { GenerateQuotation } from '../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases';

const prisma = new PrismaClient();
const repo = new PrismaCustomOrderRepository(prisma);
const quotationRepo = new PrismaQuotationRepository(prisma);

async function main() {
  const clientEmail = 'clientetest@surtitelas.com';
  const clientPassword = 'ClienteTest123!';
  const adminEmail = 'admintest@surtitelas.com';
  const adminPassword = 'AdminTest123!';

  // Login as client
  const clientLogin = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password: clientPassword }),
  });
  const clientLoginJson = await clientLogin.json();
  const clientToken = clientLoginJson.data.accessToken;

  // Create order
  const createRes = await fetch('http://localhost:3000/api/v1/custom-orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({
      clienteNombre: 'Cliente Prueba',
      clienteEmail: clientEmail,
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
  const createJson = await createRes.json();
  const order = createJson.data;
  console.log('Order created:', order.id, order.numeroSolicitud, 'estado:', order.estado);

  // Login as admin
  const adminLogin = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const adminLoginJson = await adminLogin.json();
  const adminToken = adminLoginJson.data.accessToken;

  // Generate quotation
  const quoteRes = await fetch(`http://localhost:3000/api/v1/admin/custom-orders/${order.id}/quotation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
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
  const quoteJson = await quoteRes.json();
  console.log('Quote response status:', quoteRes.status);
  console.log('Quote response:', JSON.stringify(quoteJson, null, 2));

  // Check DB directly
  const dbOrder = await prisma.custom_orders.findUnique({
    where: { id: order.id },
    select: { id: true, numero: true, estado: true }
  });
  const dbQuote = await prisma.quotes.findFirst({
    where: { custom_order_id: order.id },
    select: { id: true, numero: true, estado: true }
  });
  console.log('DB Order:', dbOrder);
  console.log('DB Quote:', dbQuote);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
