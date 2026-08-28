import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM quote_items WHERE custom_order_item_id IS NOT NULL
  `;
  console.log('quote_items with custom_order_item_id:', count);

  const samples = await prisma.$queryRaw`
    SELECT id, quote_id, custom_order_item_id, concepto FROM quote_items WHERE custom_order_item_id IS NOT NULL LIMIT 5
  `;
  console.log('samples:', samples);

  await prisma.$disconnect();
}
main();
