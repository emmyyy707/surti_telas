import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.update({
    where: { email: 'admin@surtitelas.com' },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordHash: await import('bcryptjs').then(({ default: bcrypt }) => bcrypt.hash('admin123', 12)),
    },
  });
  console.log('ADMIN_UNLOCKED', JSON.stringify(admin, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
