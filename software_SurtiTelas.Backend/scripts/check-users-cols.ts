import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const columns: { column_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' ORDER BY ordinal_position`
  );
  console.log(columns.map(c => c.column_name).join('\n'));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
