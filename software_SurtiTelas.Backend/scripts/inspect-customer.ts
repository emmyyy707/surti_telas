import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const c = await prisma.customer.findFirst({
    where: { email: 'cliente@surtitelas.com' },
  });
  console.log(JSON.stringify(c, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
