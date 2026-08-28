import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('INICIO');
  try {
    const cols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'quote_items' AND column_name = 'custom_order_item_id'
    `;
    console.log('quote_items custom_order_item_id existe:', cols);
  } catch (e: any) {
    console.log('ERROR:', e.message);
  }
  try {
    const cols2 = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'order_items' AND column_name = 'custom_order_item_id'
    `;
    console.log('order_items custom_order_item_id existe:', cols2);
  } catch (e: any) {
    console.log('ERROR:', e.message);
  }
  await prisma.$disconnect();
  console.log('FIN');
}
main();
