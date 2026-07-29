import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log('All tables:', tables.map((t: any) => t.table_name).join(', '));
  await prisma.$disconnect();
}

main().catch(console.error);
