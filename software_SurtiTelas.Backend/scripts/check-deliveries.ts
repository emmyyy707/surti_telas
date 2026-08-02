import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deliveries = await prisma.delivery.findMany({
    where: { domiciliarioId: 'cms4391o7001hig4g20elo8v4', deletedAt: null },
    select: { id: true, orderId: true, estado: true, domiciliarioId: true },
  });
  console.log(JSON.stringify(deliveries, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
