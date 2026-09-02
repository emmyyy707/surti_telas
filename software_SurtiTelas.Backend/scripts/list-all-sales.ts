import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    where: { deletedAt: null },
    include: {
      order: {
        select: {
          estado: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  console.log('All sales (oldest first):');
  for (const sale of sales) {
    console.log(`  ${sale.id} | estado=${sale.estado} | order.estado=${sale.order?.estado ?? 'N/A'} | createdAt=${sale.createdAt}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
