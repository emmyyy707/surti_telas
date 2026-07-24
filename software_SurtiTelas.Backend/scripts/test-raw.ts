import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = 'admin@surtitelas.com' LIMIT 1`);
    console.log('Raw query result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Raw query error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
