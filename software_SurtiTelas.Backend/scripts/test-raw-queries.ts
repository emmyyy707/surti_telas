import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`SELECT id, email FROM users WHERE email = $1 LIMIT 1`, 'admin@surtitelas.com');
    console.log('Raw execute works');
  } catch (e) {
    console.error('Raw execute error:', e);
  }
  
  try {
    await prisma.$queryRawUnsafe(`SELECT id, email FROM users WHERE email = $1 LIMIT 1`, 'admin@surtitelas.com');
    console.log('Raw query works');
  } catch (e) {
    console.error('Raw query error:', e);
  }
  
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT id, email FROM users WHERE email = ${'admin@surtitelas.com'} LIMIT 1`;
    console.log('Tagged query works:', JSON.stringify(result));
  } catch (e) {
    console.error('Tagged query error:', e);
  }
  
  await prisma.$disconnect();
}

main();
