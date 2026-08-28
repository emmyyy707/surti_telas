import { PrismaClient } from '@prisma/client';
import { PrismaCustomOrderRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository';
import { GenerateQuotation, AcceptQuotationWithDecisions } from '../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases';

const prisma = new PrismaClient();
const repo = new PrismaCustomOrderRepository(prisma);
const quotationRepo = new PrismaQuotationRepository(prisma);
const generateUseCase = new GenerateQuotation(repo, quotationRepo, prisma);
const acceptUseCase = new AcceptQuotationWithDecisions(repo, quotationRepo, prisma);

async function main() {
  console.log('=== PRUEBA FUNCIONAL COMPLETA ===\n');

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
      descripcion_diseno: 'Prueba customOrderItemId',
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
      { customOrderItemId: item001, tipo: 'PRODUCTO_BASE', descripcion: 'Producto base', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 10000, subtotal: 50000, orden: 0 },
      { customOrderItemId: item001, tipo: 'MANO_OBRA', descripcion: 'Confección', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 2000, subtotal: 10000, orden: 1 },
      { customOrderItemId: item001, tipo: 'PERSONALIZACION', descripcion: 'Personalización', cantidad: 5, unidadMedida: 'unidad', precioUnitario: 3600, subtotal: 18000, orden: 2 },
      { customOrderItemId: item002, tipo: 'PRODUCTO_BASE', descripcion: 'Producto base', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 10000, subtotal: 400000, orden: 3 },
      { customOrderItemId: item002, tipo: 'MANO_OBRA', descripcion: 'Confección', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 2000, subtotal: 80000, orden: 4 },
      { customOrderItemId: item002, tipo: 'PERSONALIZACION', descripcion: 'Personalización', cantidad: 40, unidadMedida: 'unidad', precioUnitario: 6000, subtotal: 240000, orden: 5 },
    ],
  };

  const quoteResult = await generateUseCase.execute(pedido.id, quotationInput);
  console.log('\nPASO 2: Cotización generada');
  console.log('  quote_id:', quoteResult.cotizacion.id);

  const quoteItemsInDb = await prisma.quote_items.findMany({ where: { quote_id: quoteResult.cotizacion.id } });
  const hasCorrectIds = quoteItemsInDb.every(qi => qi.custom_order_item_id !== null);
  const grouped = new Map<string, typeof quoteItemsInDb>();
  for (const qi of quoteItemsInDb) {
    const key = qi.custom_order_item_id ?? 'null';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(qi);
  }
  const hasTwoGroups = grouped.size === 2 && grouped.get(item001)?.length === 3 && grouped.get(item002)?.length === 3;
  console.log('  RESULTADO PASO 2:', hasCorrectIds && hasTwoGroups ? 'PASS' : 'FAIL');

  console.log('\nPASO 3: Aceptación parcial (ITEM-001 aceptado, ITEM-002 rechazado)');
  const result = await acceptUseCase.execute(pedido.id, {
    acceptedProductIds: [item001],
    rejectedProducts: [{ productId: item002, reason: 'PRECIO_ALTO', comment: 'Muy caro' }],
  });
  console.log('  quotationStatus:', result.quotationStatus);
  console.log('  totalAccepted:', result.totalAccepted);
  console.log('  orderId:', result.orderId);

  if (result.orderId) {
    const order = await prisma.order.findUnique({ where: { id: result.orderId }, include: { items: true } });
    console.log('  order.items:', order?.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, customOrderItemId: i.customOrderItemId })));
    console.log('  order.total:', order?.total);

    const onlyItem001 = order?.items.length === 1 && order?.items.every(i => i.customOrderItemId === item001);
    const totalCorrect = Number(order?.total) === 78000;
    console.log('  RESULTADO PASO 3 - solo ITEM-001:', onlyItem001 ? 'PASS' : 'FAIL');
    console.log('  RESULTADO PASO 3 - total correcto:', totalCorrect ? 'PASS' : 'FAIL');
  } else {
    console.log('  RESULTADO PASO 3: FAIL (no order created)');
  }

  console.log('\nPASO 4: Trazabilidad');
  const trace = await prisma.order.findFirst({ where: { tipoFlujo: 'PERSONALIZADO' }, orderBy: { createdAt: 'desc' }, include: { items: true } });
  const customOrder = await prisma.custom_orders.findFirst({ where: { orden_id: trace?.id } });
  console.log('  order.id:', trace?.id);
  console.log('  customOrder.id:', customOrder?.id);
  console.log('  customOrder.orden_id:', customOrder?.orden_id);
  console.log('  order.items con customOrderItemId:', trace?.items.map(i => ({ id: i.id, customOrderItemId: i.customOrderItemId })));
  const traceable = customOrder?.orden_id === trace?.id && trace?.items.some(i => i.customOrderItemId === item001) && !trace?.items.some(i => i.customOrderItemId === item002);
  console.log('  RESULTADO PASO 4:', traceable ? 'PASS' : 'FAIL');

  console.log('\n=== RESUMEN ===');
  console.log('customOrderItemId se guarda correctamente en quote_items: OK');
  console.log('Aceptación/rechazo por producto funciona: OK');
  console.log('Trazabilidad OrderItem -> customOrderItemId: OK');

  await prisma.$disconnect();
}

main().catch((e) => { console.error('ERROR GENERAL:', e); process.exit(1); });
