import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();
  const user = await p.user.findUnique({ where: { email: 'cliente@surtitelas.com' } });
  const customer = await p.customer.findFirst({ where: { email: 'cliente@surtitelas.com' } });
  console.log('USER_NOMBRE:', user?.nombre);
  console.log('CUSTOMER_NOMBRE:', customer?.nombre);
  console.log('CUSTOMER_ID:', customer?.id);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
