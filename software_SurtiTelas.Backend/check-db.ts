import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const userCount = await p.user.count();
  console.log('Users:', userCount);
  const customerCount = await p.customer.count();
  console.log('Customers:', customerCount);
  const orderCount = await p.order.count();
  console.log('Orders:', orderCount);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
