import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  console.log('Total users via findMany:', users.length);
  console.log('Users:', users);
  
  await prisma.$disconnect();
}

main();
