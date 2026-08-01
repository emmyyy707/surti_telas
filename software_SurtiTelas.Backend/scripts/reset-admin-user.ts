import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@surtitelas.com';
  const password = 'Surti2026!';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash: hash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log('UPDATED_USER', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
