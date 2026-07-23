import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SurtiTelas2025*', 12);
  const user = await prisma.user.update({
    where: { email: 'admin@surtitelas.com' },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      estado: 'ACTIVO',
    },
  });

  console.log('UPDATED', user.id, user.email, user.estado);
  console.log('NEW_HASH_PREFIX', user.passwordHash.slice(0, 20));
  console.log('NEW_HASH_LENGTH', user.passwordHash.length);
}

main()
  .catch((err) => {
    console.error('ERROR', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
