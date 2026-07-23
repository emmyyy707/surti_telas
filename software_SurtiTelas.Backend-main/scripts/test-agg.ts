import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const agg = await prisma.user.aggregate({ _count: true });
    console.log('Aggregate count:', agg._count);
  } catch (e: any) {
    console.error('Aggregate error:', e.message, e.meta);
  }
  
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    console.log('Select id only:', users.length);
  } catch (e: any) {
    console.error('Select error:', e.message, e.meta);
  }
  
  await prisma.$disconnect();
}

main();
