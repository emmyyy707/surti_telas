import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  await p.user.update({
    where: { email: 'cliente@surtitelas.com' },
    data: { nombre: 'Andres Daniel Ruiz Murillo' },
  });

  console.log('Usuario cliente nombre actualizado a Andres Daniel Ruiz Murillo');
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
