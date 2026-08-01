import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  const user = await p.user.findUnique({ where: { email: 'cliente@surtitelas.com' } });
  if (!user) {
    console.log('Usuario cliente no encontrado');
    await p.$disconnect();
    return;
  }

  const customer = await p.customer.findFirst({ where: { email: user.email } });
  if (!customer) {
    console.log('Customer asociado no encontrado');
    await p.$disconnect();
    return;
  }

  await p.customer.update({
    where: { id: customer.id },
    data: { nombre: 'Andres Daniel Ruiz Murillo' },
  });

  console.log('Customer nombre actualizado a Andres Daniel Ruiz Murillo');
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
