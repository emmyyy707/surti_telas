import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@surtitelas.com' },
    select: { id: true, email: true, nombre: true, role: true, estado: true, failedLoginAttempts: true, lockedUntil: true },
  });
  console.log(JSON.stringify(admin, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
