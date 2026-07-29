import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%delivery%' OR table_name LIKE '%return%')
    ORDER BY table_name
  `;
  console.log('Tables:', tables);
  await prisma.$disconnect();
}

main().catch(console.error);
