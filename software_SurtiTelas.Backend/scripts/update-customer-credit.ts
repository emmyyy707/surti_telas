import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.update({
    where: { id: 'cms66px6u0001igxksif1rcgy' },
    data: { cupoTotal: 1000000 },
  });
  console.log('UPDATED_CUSTOMER', JSON.stringify(customer, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
