import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: { estado: { in: ['DESPACHADO', 'EN_CAMINO'] }, deletedAt: null },
    select: { id: true, numero: true, estado: true, deliveries: { where: { deletedAt: null }, select: { id: true, estado: true, domiciliarioId: true } } },
  });
  console.log(JSON.stringify(orders, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
