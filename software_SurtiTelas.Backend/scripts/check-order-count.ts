import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  const where = { deletedAt: null } as const;

  const [rows, total] = await p.$transaction([
    p.order.findMany({ where, take: 10 }),
    p.order.count({ where }),
  ]);

  console.log('ROWS', rows.length);
  console.log('TOTAL', total);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
