import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@surtitelas.com' } });
    console.log('findUnique result:', user?.email);
  } catch (e) {
    console.error('findUnique error:', e);
  }
  
  try {
    const users = await prisma.user.findMany({ where: { email: 'admin@surtitelas.com' } });
    console.log('findMany result:', users.map(u => u.email));
  } catch (e) {
    console.error('findMany error:', e);
  }
  
  try {
    const count = await prisma.user.count();
    console.log('count result:', count);
  } catch (e) {
    console.error('count error:', e);
  }

  await prisma.$disconnect();
}

main();
