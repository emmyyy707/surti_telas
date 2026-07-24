const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const model = prisma.getModel('Delivery');
    console.log('Delivery model fields:', Object.keys(model.fields).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
