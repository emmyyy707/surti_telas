import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deliveryId = 'cmsc8dmll000zigh4zm80y2xt';
  const domiciliarioId = 'cms4391o7001hig4g20elo8v4';

  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data: { domiciliarioId, estado: 'ASIGNADO' },
    select: { id: true, orderId: true, estado: true, domiciliarioId: true },
  });

  console.log('Delivery actualizada:', JSON.stringify(updated, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
