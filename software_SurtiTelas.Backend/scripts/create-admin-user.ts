import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@surtitelas.com';
  const password = 'Surti2026!';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nombre: 'Administrador Demo',
      passwordHash: hash,
      role: 'ADMIN',
      estado: 'ACTIVO',
    },
  });

  console.log('USER', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
