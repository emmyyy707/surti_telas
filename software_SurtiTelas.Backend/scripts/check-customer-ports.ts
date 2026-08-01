import { PrismaClient } from '@prisma/client';

async function main() {
  const p5433 = new PrismaClient({ datasources: { db: { url: 'postgresql://surtitelas:surtitelas123@localhost:5433/surtitelas?schema=public' } } });
  const p5432 = new PrismaClient({ datasources: { db: { url: 'postgresql://surtitelas:surtitelas123@localhost:5432/surtitelas?schema=public' } } });

  try {
    const r5433 = await p5433.customer.findFirst({ where: { id: 'cms66px6u0001igxksif1rcgy' } });
    console.log('ON_5433:', r5433 ? 'FOUND' : 'NOT_FOUND');
  } catch (e) {
    console.log('ERR_5433:', (e as Error).message);
  }

  try {
    const r5432 = await p5432.customer.findFirst({ where: { id: 'cms66px6u0001igxksif1rcgy' } });
    console.log('ON_5432:', r5432 ? 'FOUND' : 'NOT_FOUND');
  } catch (e) {
    console.log('ERR_5432:', (e as Error).message);
  }

  await p5433.$disconnect();
  await p5432.$disconnect();
}

main();
