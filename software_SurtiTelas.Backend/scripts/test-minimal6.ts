import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const test = await prisma.test.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('Test found:', test?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
