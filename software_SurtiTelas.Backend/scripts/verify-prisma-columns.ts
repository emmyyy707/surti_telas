import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const qi = await prisma.quote_items.create({
      data: {
        id: 'test-check-qi',
        quote_id: 'test-check',
        concepto: 'Test',
        cantidad: 1,
        precio_unitario: 1000,
        subtotal: 1000,
        custom_order_item_id: 'test-item-id',
      },
    });
    console.log('OK quote_items.create con custom_order_item_id:', qi.id);
    await prisma.quote_items.delete({ where: { id: qi.id } });
  } catch (e: any) {
    console.log('ERROR quote_items:', e.message);
  }

  try {
    const oi = await prisma.orderItem.create({
      data: {
        orderId: 'test-order',
        nombre: 'Test item',
        precio: 1000,
        cantidad: 1,
        customOrderItemId: 'test-item-id',
      },
    });
    console.log('OK orderItem.create con customOrderItemId:', oi.id);
    await prisma.orderItem.delete({ where: { id: oi.id } });
  } catch (e: any) {
    console.log('ERROR orderItem:', e.message);
  }

  await prisma.$disconnect();
}
main();
