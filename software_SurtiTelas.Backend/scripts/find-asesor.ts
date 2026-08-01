import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();
  const asesor = await p.user.findFirst({
    where: { role: 'ASESOR', deletedAt: null },
    select: { id: true, email: true, nombre: true },
  });
  console.log('ASESOR', JSON.stringify(asesor, null, 2));
  await p.$disconnect();
}

main().catch((e) => console.error(e));
