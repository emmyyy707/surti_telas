import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'deliveries'
    ORDER BY column_name
  `;
  console.log('Deliveries columns:', columns);
  await prisma.$disconnect();
}

main().catch(console.error);
