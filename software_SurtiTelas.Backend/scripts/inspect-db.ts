import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';

const prisma = new PrismaClient();

async function main() {
  const tables: string[] = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
  );

  for (const t of tables as { table_name: string }[]) {
    const cols: any[] = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns WHERE table_schema='public' AND table_name=$1
       ORDER BY ordinal_position`,
      t.table_name
    );
    console.log(`\n=== ${t.table_name} (${cols.length} columnas) ===`);
    for (const c of cols) {
      const nullable = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      let def = c.column_default ? ` DEFAULT ${c.column_default}` : '';
      console.log(`  - ${c.column_name}: ${c.data_type} ${nullable}${def}`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
