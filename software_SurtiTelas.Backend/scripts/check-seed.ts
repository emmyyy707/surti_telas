import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables: { table_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
  );
  for (const { table_name } of tables) {
    const n: any = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "${table_name}"`);
    console.log(`${table_name.padEnd(24)} ${n[0].n}`);
  }

  const ped = await prisma.order.findFirst({ where: { numero: 'PED-000001' } });
  console.log('\nPED-000001:', ped ? `EXISTE (${ped.estado}, total ${ped.total})` : 'NO EXISTE');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@surtitelas.com' } });
  console.log('admin@surtitelas.com:', admin ? 'EXISTE' : 'NO EXISTE');
  const prod = await prisma.product.findUnique({ where: { ref: 'REF-001' } });
  console.log('REF-001:', prod ? 'EXISTE' : 'NO EXISTE');
}

main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
