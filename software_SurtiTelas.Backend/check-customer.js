const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { email: 'flujo-e2e@test.com' },
    select: { id: true, nombre: true, email: true, estado: true },
  });
  console.log(JSON.stringify(customer, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
