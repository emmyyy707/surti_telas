import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.userX.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('UserX found:', user?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
