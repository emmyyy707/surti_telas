const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.delivery.findMany({ take: 1 });
    console.log('findMany success:', result);
  } catch (e) {
    console.error('findMany error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
