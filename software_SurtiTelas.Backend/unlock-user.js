import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'admin@surtitelas.com' },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  console.log('Usuario desbloqueado:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
