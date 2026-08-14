const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.custom_orders.findFirst({
    where: { numero: 'SOL-0011' },
    select: { id: true, numero: true, cliente_id: true, estado: true },
  });
  console.log(JSON.stringify(order, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
