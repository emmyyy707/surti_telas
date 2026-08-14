const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: { estado: 'ACTIVO' },
    select: { id: true, nombre: true, email: true },
    take: 10,
  });
  console.log(JSON.stringify(customers, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
