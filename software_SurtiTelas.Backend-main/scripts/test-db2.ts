import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected');
    
    // Test 1: findFirst with email
    const user = await prisma.user.findFirst({ where: { email: 'admin@surtitelas.com' } });
    console.log('Test 1 - findFirst email:', user?.email);
    
    // Test 2: findFirst without where
    const users = await prisma.user.findFirst();
    console.log('Test 2 - findFirst empty:', users?.email);
    
    // Test 3: findMany
    const all = await prisma.user.findMany();
    console.log('Test 3 - findMany count:', all.length);
    
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
