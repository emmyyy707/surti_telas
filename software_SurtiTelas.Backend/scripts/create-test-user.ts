import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'cliente@surtitelas.com';
  const password = 'Surti2026!';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nombre: 'Cliente Demo',
      passwordHash: hash,
      role: 'CLIENTE',
      estado: 'ACTIVO',
    },
  });

  const asesor = await prisma.user.findFirst({ where: { role: 'ASESOR', deletedAt: null }, select: { id: true } });
  const asesorId = asesor?.id ?? null;

  const existing = await prisma.customer.findFirst({ where: { email } });
  const customer = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data: { nombre: user.nombre } })
    : await prisma.customer.create({
        data: {
          nombre: user.nombre,
          email: user.email,
          telefono: null,
          ciudad: null,
          nit: null,
          asesorId,
          cupoTotal: 1000000,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: false,
          estado: 'ACTIVO',
        },
      });

  console.log('USER', JSON.stringify(user, null, 2));
  console.log('CUSTOMER', JSON.stringify(customer, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
