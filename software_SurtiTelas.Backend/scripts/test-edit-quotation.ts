import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderId = 'cmt0pg838000migw00ifp7uzi';
  const quoteId = '1787181046647-68l7ihx';

  // Step 1: Reject the quotation (simulating client rejection)
  await prisma.quotes.update({
    where: { id: quoteId },
    data: {
      estado: 'PENDIENTE',
      negotiation_count: 1,
      negotiation_history: [{ step: 1, reason: 'Prueba rechazo', date: new Date().toISOString(), user: 'test' }],
    }
  });
  await prisma.custom_orders.update({
    where: { id: orderId },
    data: { estado: 'COTIZACION_RECHAZADA', motivo_rechazo: 'Prueba rechazo' }
  });

  console.log('After rejection:');
  const afterRejectOrder = await prisma.custom_orders.findUnique({ where: { id: orderId }, select: { estado: true } });
  const afterRejectQuote = await prisma.quotes.findUnique({ where: { id: quoteId }, select: { estado: true, negotiation_count: true } });
  console.log('Order:', afterRejectOrder);
  console.log('Quote:', afterRejectQuote);

  // Step 2: Admin edits and saves again via GenerateQuotation
  const { PrismaCustomOrderRepository } = require('../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository');
  const { PrismaQuotationRepository } = require('../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository');
  const { GenerateQuotation } = require('../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases');

  const repo = new PrismaCustomOrderRepository(prisma);
  const quotationRepo = new PrismaQuotationRepository(prisma);
  const generateQuotation = new GenerateQuotation(repo, quotationRepo, prisma);

  const result = await generateQuotation.execute(orderId, {
    subtotal: 250000,
    impuestos: 47500,
    descuento: 0,
    tiempoEstimadoDias: 5,
    validaHasta: '2026-08-26T00:00:00.000Z',
    condicionesPago: '50% anticipo, 50% contraentrega',
    observaciones: 'Cotización editada',
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
  });

  console.log('\nAfter admin re-saves:');
  const afterEditOrder = await prisma.custom_orders.findUnique({ where: { id: orderId }, select: { estado: true } });
  const afterEditQuote = await prisma.quotes.findUnique({ where: { id: quoteId }, select: { estado: true, negotiation_count: true } });
  console.log('Order:', afterEditOrder);
  console.log('Quote:', afterEditQuote);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
