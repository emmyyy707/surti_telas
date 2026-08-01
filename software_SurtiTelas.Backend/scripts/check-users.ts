import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();
  const users = await p.user.findMany({
    where: {
      email: {
        in: ['cliente@surtitelas.com', 'admin@surtitelas.com', 'asesor@surtitelas.com'],
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      nombre: true,
    },
  });
  console.log('USERS:', JSON.stringify(users, null, 2));
  await p.$disconnect();
}

main().catch((e) => console.error(e));
