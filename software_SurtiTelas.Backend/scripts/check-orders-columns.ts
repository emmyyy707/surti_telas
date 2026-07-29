import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'orders'
    AND (column_name LIKE '%cliente%' OR column_name LIKE '%nombre%')
    ORDER BY column_name
  `;
  console.log('Order columns:', columns);
  await prisma.$disconnect();
}

main().catch(console.error);
