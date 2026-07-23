import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:12345@localhost:5432/postgres?schema=public'
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('User found:', user?.email);
  } catch (e: any) {
    console.error('Error on postgres DB:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
