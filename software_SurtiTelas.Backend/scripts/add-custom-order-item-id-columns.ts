import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRaw`
      ALTER TABLE "quote_items"
      ADD COLUMN IF NOT EXISTS "custom_order_item_id" TEXT
    `;
    console.log('OK: custom_order_item_id agregado a quote_items');
  } catch (e: any) {
    console.log('ERROR quote_items:', e.message);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "custom_order_item_id" TEXT
    `;
    console.log('OK: custom_order_item_id agregado a order_items');
  } catch (e: any) {
    console.log('ERROR order_items:', e.message);
  }

  try {
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "quote_items_custom_order_item_id_idx"
      ON "quote_items" ("custom_order_item_id")
    `;
    console.log('OK: índice creado en quote_items.custom_order_item_id');
  } catch (e: any) {
    console.log('ERROR index quote_items:', e.message);
  }

  try {
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "order_items_custom_order_item_id_idx"
      ON "order_items" ("custom_order_item_id")
    `;
    console.log('OK: índice creado en order_items.custom_order_item_id');
  } catch (e: any) {
    console.log('ERROR index order_items:', e.message);
  }

  await prisma.$disconnect();
}
main();
