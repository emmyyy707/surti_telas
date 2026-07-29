import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@surtitelas.com' },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      estado: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      twoFactorEnabled: true,
    },
  });
  console.log('ADMIN_USER', JSON.stringify(admin, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
