const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany({ where: { id: 'cmsss8szo0001ig0o2binkg2o' } }).then(() => console.log('Test order deleted')).catch(e => console.error('Delete test order error:', e));
  await prisma.$disconnect();
}

main();
