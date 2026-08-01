import { PrismaClient, Role } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  const users = await p.user.findMany({
    where: { role: Role.CLIENTE, deletedAt: null },
    select: { id: true, email: true, nombre: true },
  });

  for (const user of users) {
    const customer = await p.customer.findFirst({ where: { email: user.email } });
    if (!customer) {
      const asesor = await p.user.findFirst({ where: { role: Role.ASESOR, deletedAt: null }, select: { id: true } });
      const created = await p.customer.create({
        data: {
          nombre: user.nombre ?? user.email,
          email: user.email,
          telefono: null,
          ciudad: null,
          nit: null,
          asesorId: asesor?.id ?? null,
           cupoTotal: 1000000,
           cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: false,
          estado: 'ACTIVO',
        },
      });
      console.log(`CREATED customer for ${user.email}: ${created.id} - ${created.nombre}`);
    } else {
      await p.customer.update({
        where: { id: customer.id },
        data: { nombre: user.nombre ?? customer.nombre },
      });
      console.log(`UPDATED customer for ${user.email}: ${customer.id} - ${user.nombre}`);
    }
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
