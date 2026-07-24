const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "existe" BOOLEAN DEFAULT true`;
    console.log('Added existe column to deliveries');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
