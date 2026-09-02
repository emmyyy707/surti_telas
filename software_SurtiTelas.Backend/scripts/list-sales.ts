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
          id: true,
          numero: true,
          estado: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('=== SALES LIST ===');
  for (const sale of sales) {
    console.log('---');
    console.log('sale.id:', sale.id);
    console.log('sale.estado:', sale.estado);
    console.log('order.numero:', sale.order?.numero);
    console.log('order.estado:', sale.order?.estado);
    console.log('order.id:', sale.order?.id);
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
