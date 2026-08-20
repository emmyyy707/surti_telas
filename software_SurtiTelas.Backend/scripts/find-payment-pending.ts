import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find an order in PAGO_PENDIENTE state
  const order = await prisma.custom_orders.findFirst({
    where: { estado: 'PAGO_PENDIENTE', deleted_at: null },
    include: { quotes: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!order) {
    console.log('No PAGO_PENDIENTE orders found');
    await prisma.$disconnect();
    return;
  }

  console.log('Found order:', order.id, order.numero, 'estado:', order.estado);
  console.log('Quote estado:', order.quotes?.estado);
  console.log('Quote total:', order.quotes?.total);
  console.log('Quote valorAnticipo:', order.quotes?.valor_anticipo);
  console.log('Quote saldo:', order.quotes?.saldo);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
