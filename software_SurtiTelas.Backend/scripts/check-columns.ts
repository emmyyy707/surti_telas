import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const cols = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quote_items'
      ORDER BY ordinal_position
    `;
    console.log('quote_items columns:', JSON.stringify(cols, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.message);
  }

  try {
    const cols2 = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `;
    console.log('order_items columns:', JSON.stringify(cols2, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.message);
  }

  await prisma.$disconnect();
}
main();
