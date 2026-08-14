const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customOrderId = 'cmss3b5y70009igsksbx3z6q3';
  const orderId = 'cmssss8pt0001igog5iao9z1a';

  const customOrder = await prisma.custom_orders.findFirst({
    where: { id: customOrderId },
    select: { id: true, numero: true, estado: true, orden_id: true, cliente_id: true },
  });
  console.log('Custom order:', JSON.stringify(customOrder, null, 2));

  const order = await prisma.order.findFirst({
    where: { id: orderId },
    select: { id: true, numero: true, clienteId: true, asesorId: true, estado: true, tipoFlujo: true, total: true, itemsCount: true },
  });
  console.log('Order:', JSON.stringify(order, null, 2));

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { id: true, nombre: true, precio: true, cantidad: true, productId: true },
  });
  console.log('Order items:', JSON.stringify(orderItems, null, 2));

  const productionOrder = await prisma.productionOrder.findFirst({
    where: { pedidoId: orderId },
    select: { id: true, referencia: true, estado: true, cantidad: true },
  });
  console.log('Production order:', JSON.stringify(productionOrder, null, 2));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
