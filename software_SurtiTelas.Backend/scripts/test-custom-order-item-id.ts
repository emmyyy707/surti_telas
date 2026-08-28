import { PrismaClient } from '@prisma/client';
import { PrismaCustomOrderRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository';
import { GenerateQuotation, AcceptQuotationWithDecisions, ConvertToOrder } from '../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases';

const prisma = new PrismaClient();
const repo = new PrismaCustomOrderRepository(prisma);
const quotationRepo = new PrismaQuotationRepository(prisma);
const generateUseCase = new GenerateQuotation(repo, quotationRepo, prisma);
const acceptUseCase = new AcceptQuotationWithDecisions(repo, quotationRepo, prisma);
const convertUseCase = new ConvertToOrder(repo, prisma, quotationRepo);

async function main() {
  console.log('=== PRUEBA FUNCIONAL: FLUJO REAL DE GENERACIÓN DE COTIZACIÓN ===\n');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', estado: 'ACTIVO' } });
  const customer = await prisma.customer.findFirst({ where: { email: 'e2e.aceptacion@test.com' } });

  const uniqueNum = Date.now().toString(36).toUpperCase();
  const pedido = await prisma.custom_orders.create({
    data: {
      numero: `SOL-PRUEBA-${uniqueNum}`,
      cliente_id: customer!.id,
      cliente_nombre: customer!.nombre,
      cliente_telefono: '3000000000',
      estado: 'COTIZADO',
      tipo_prenda: 'CAMISA',
      tecnica_personalizacion: 'BORDADO_ESTAMPADO',
      descripcion_diseno: 'Prueba customOrderItemId flujo real',
      cantidad_total: 45,
      referencias: [],
      colores_solicitados: [],
      tallas: { M: 5, L: 40 },
      custom_order_items: {
        create: [
          {
            producto_nombre: 'Camisa básica de algodón',
            descripcion: 'Camisa básica de algodón',
            tipo_personalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 5,
            talla: 'M',
            color: 'Azul',
            material: 'Algodón',
            distribucion_tallas: { M: 5 },
            imagenes_referencia: [],
          },
          {
            producto_nombre: 'Camisa básica de algodón',
            descripcion: 'Camisa básica de algodón',
            tipo_personalizacion: 'ESTAMPADO',
            cantidad: 40,
            talla: 'L',
            color: 'Blanco',
            material: 'Algodón',
            distribucion_tallas: { L: 40 },
            imagenes_referencia: [],
          },
        ],
      },
    },
    include: { custom_order_items: true },
  });

  const items = pedido.custom_order_items;
  const item001 = items[0].id;
  const item002 = items[1].id;

  console.log('PASO 1: Custom order creado');
  console.log('  custom_order_id:', pedido.id);
  console.log('  items:', items.map(i => ({ id: i.id, nombre: i.producto_nombre, cantidad: i.cantidad })));

  // Generar cotización SIN customOrderItemId en el payload (flujo real actual)
  const quotationInput = {
    subtotal: 380000,
    impuestos: 0,
    descuento: 0,
    tiempoEstimadoDias: 7,
    validaHasta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    condicionesPago: '50% anticipo',
    generadoPorId: admin!.id,
    generadoPorNombre: admin!.nombre,
    draft: false,
    detalles: [
      { tipo: 'PRODUCTO_BASE', descripcion: 'Producto base', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 10000, subtotal: 50000, orden: 0 },
      { tipo: 'MANO_OBRA', descripcion: 'Confección', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 2000, subtotal: 10000, orden: 1 },
      { tipo: 'PERSONALIZACION', descripcion: 'Personalización', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 3600, subtotal: 18000, orden: 2 },
      { tipo: 'PRODUCTO_BASE', descripcion: 'Producto base', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 10000, subtotal: 400000, orden: 3 },
      { tipo: 'MANO_OBRA', descripcion: 'Confección', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 2000, subtotal: 80000, orden: 4 },
      { tipo: 'PERSONALIZACION', descripcion: 'Personalización', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 6000, subtotal: 240000, orden: 5 },
    ],
  };

  const quoteResult = await generateUseCase.execute(pedido.id, quotationInput);
  console.log('\nPASO 2: Cotización generada');
  console.log('  quote_id:', quoteResult.cotizacion.id);
  console.log('  quote numero:', quoteResult.cotizacion.numeroCotizacion);
  console.log('  detalles:', quoteResult.cotizacion.detalles.map((d: any) => ({ id: d.id, customOrderItemId: d.customOrderItemId, concepto: d.concepto })));

  // Verificar en DB los quote_items
  const quoteItemsInDb = await prisma.quote_items.findMany({ where: { quote_id: quoteResult.cotizacion.id } });
  console.log('  quote_items en DB:', quoteItemsInDb.map(qi => ({ id: qi.id, custom_order_item_id: qi.custom_order_item_id, concepto: qi.concepto })));

  const allNull = quoteItemsInDb.every(qi => qi.custom_order_item_id === null);
  console.log('  ¿Todos custom_order_item_id son null?', allNull);
  console.log('  RESULTADO PRUEBA VALIDADOR:', allNull ? 'BUG CONFIRMADO: customOrderItemId se pierde en el validador Zod' : 'customOrderItemId se preserva');

  // Ahora simular el flujo de aceptación/rechazo del frontend
  // Como customOrderItemId es null, el frontend agruparía cada concepto como producto separado
  console.log('\nPASO 3: Simulando aceptación parcial desde frontend');
  const allDecisions = [
    { detalleId: quoteItemsInDb[0].id, status: 'ACEPTADO' },
    { detalleId: quoteItemsInDb[1].id, status: 'ACEPTADO' },
    { detalleId: quoteItemsInDb[2].id, status: 'ACEPTADO' },
    { detalleId: quoteItemsInDb[3].id, status: 'RECHAZADO', rejectReason: 'PRECIO_ALTO', rejectComment: 'Muy caro' },
    { detalleId: quoteItemsInDb[4].id, status: 'RECHAZADO', rejectReason: 'PRECIO_ALTO', rejectComment: 'Muy caro' },
    { detalleId: quoteItemsInDb[5].id, status: 'RECHAZADO', rejectReason: 'PRECIO_ALTO', rejectComment: 'Muy caro' },
  ];

  const acceptedIds = allDecisions.filter(d => d.status === 'ACEPTADO').map(d => d.detalleId);
  const rejectedItems = allDecisions.filter(d => d.status === 'RECHAZADO').map(d => ({ detalleId: d.detalleId, reason: d.rejectReason!, comment: d.rejectComment }));

  try {
    const result = await acceptUseCase.execute(pedido.id, { acceptedIds, rejectedItems });
    console.log('  quotationStatus:', result.quotationStatus);
    console.log('  totalAccepted:', result.totalAccepted);
    console.log('  orderId:', result.orderId);
    if (result.orderId) {
      const order = await prisma.order.findUnique({ where: { id: result.orderId }, include: { items: true } });
      console.log('  order.items:', order?.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad })));
      console.log('  order.total:', order?.total);
    }
    console.log('  RESULTADO PRUEBA FLUJO REAL:', result.quotationStatus === 'COTIZACION_ACEPTADA' && result.orderId ? 'PASS' : 'FAIL');
  } catch (e: any) {
    console.log('  ERROR:', e.message);
    console.log('  RESULTADO PRUEBA FLUJO REAL: FAIL');
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error('ERROR GENERAL:', e); process.exit(1); });
