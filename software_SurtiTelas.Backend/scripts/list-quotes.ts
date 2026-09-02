import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const quotes = await prisma.quotes.findMany({
    where: { deleted_at: null },
    include: {
      custom_orders: {
        select: {
          cliente_id: true,
          cliente_nombre: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('Quotes with clients:');
  for (const quote of quotes) {
    console.log(`  Quote ${quote.id} | ${quote.numero} | Cliente: ${quote.custom_orders?.cliente_nombre ?? 'N/A'} (${quote.custom_orders?.cliente_id ?? 'N/A'})`);
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
