const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const delivery = await prisma.delivery.findFirst({
      where: { id: 'cmsbzc66t0001iggwl77qvx5g', deletedAt: null },
      include: { order: { select: { id: true, numero: true, estado: true } } },
    });
    console.log('Delivery:', JSON.stringify(delivery, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
