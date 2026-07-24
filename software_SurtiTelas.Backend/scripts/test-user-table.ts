import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS test_users_table (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL
    )
  `);
  
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'test@test.com' }
    });
    console.log('User found:', user?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  }
  
  await prisma.$disconnect();
}

main();
