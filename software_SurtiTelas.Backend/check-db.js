const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.custom_orders.findFirst({
    where: { id: 'cmszh8zuy000uigcgcty1odc7' },
    include: {
      custom_order_items: {
        include: {
          personalizations: true,
        },
      },
    },
  });

  if (!order) {
    console.log('Order not found');
    return;
  }

  console.log('Order ID:', order.id);
  console.log('Order numero:', order.numeroSolicitud);

  for (const item of order.custom_order_items) {
    console.log('\nItem ID:', item.id);
    console.log('Item imagenes_referencia:', item.imagenes_referencia);
    for (const pers of item.personalizations) {
      console.log('  Personalization ID:', pers.id);
      console.log('  Personalization archivos:', pers.archivos);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
