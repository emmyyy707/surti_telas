import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'cliente@surtitelas.com' },
    select: { id: true, email: true, nombre: true },
  });
  console.log('USER', JSON.stringify(user));

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: { asesor: true, _count: { select: { orders: true } } },
  });
  console.log('CUSTOMER', JSON.stringify(customer));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
