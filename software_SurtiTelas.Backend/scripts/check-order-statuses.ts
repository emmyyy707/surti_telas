import { prisma } from '../src/config/database';

(async () => {
  try {
    const counts = await prisma.order.groupBy({
      by: ['estado'],
      where: { deletedAt: null },
      _count: { id: true },
    });
    console.log(JSON.stringify(counts, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
