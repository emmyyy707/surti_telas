import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'cliente@surtitelas.com';
  const password = 'Surti2026!';
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash, failedLoginAttempts: 0, lockedUntil: null },
  });

  const customer = await prisma.customer.findFirst({ where: { email } });
  console.log('USER password set:', email);
  console.log('CUSTOMER cupo:', customer?.cupoTotal, 'cupoUsado:', customer?.cupoUsado);

  // Also set password for all CLIENTE users for testing
  const allClientes = await prisma.user.findMany({ where: { role: 'CLIENTE' }, select: { email: true } });
  for (const c of allClientes) {
    await prisma.user.update({
      where: { email: c.email },
      data: { passwordHash: hash, failedLoginAttempts: 0, lockedUntil: null },
    });
  }
  console.log('Set password for', allClientes.length, 'CLIENTE users');
  console.log('All passwords:', password);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
