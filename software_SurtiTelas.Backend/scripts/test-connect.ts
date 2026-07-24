import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected');
    
    const count = await prisma.user.count();
    console.log('Count:', count);
    
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    console.log('FindMany:', users);
    
    // Try raw query in same connection
    const raw = await prisma.$queryRawUnsafe(`SELECT id, email FROM users LIMIT 5`);
    console.log('Raw query:', JSON.stringify(raw));
    
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
