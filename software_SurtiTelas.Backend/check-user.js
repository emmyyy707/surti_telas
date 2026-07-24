import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@surtitelas.com' },
    select: { id: true, email: true, nombre: true, role: true, estado: true, failedLoginAttempts: true, lockedUntil: true, twoFactorEnabled: true },
  });

  if (!user) {
    console.log('Usuario admin NO encontrado en la base de datos');
  } else {
    console.log('Usuario encontrado:', JSON.stringify(user, null, 2));
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
