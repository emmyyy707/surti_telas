const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM deliveries LIMIT 1`;
    console.log('Raw query success:', result);
  } catch (e) {
    console.error('Raw query error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
