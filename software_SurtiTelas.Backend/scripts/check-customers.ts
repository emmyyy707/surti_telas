import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();
  const customers = await p.customer.findMany({
    where: {
      email: {
        in: ['cliente@surtitelas.com', 'admin@surtitelas.com', 'asesor@surtitelas.com'],
      },
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      asesorId: true,
    },
  });
  console.log('CUSTOMERS:', JSON.stringify(customers, null, 2));
  await p.$disconnect();
}

main().catch((e) => console.error(e));
