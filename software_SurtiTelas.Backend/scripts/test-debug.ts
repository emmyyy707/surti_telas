import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'admin@surtitelas.com' },
      select: { id: true, email: true }
    });
    console.log('User found:', user);
  } catch (e: any) {
    console.error('Error message:', e.message);
    console.error('Error meta:', e.meta);
    
    // Try to get the query that Prisma is trying to run
    if ((e as any).query) {
      console.error('Query:', (e as any).query);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
