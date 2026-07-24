import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const constraints: any[] = await prisma.$queryRawUnsafe(`
    SELECT conname, pg_get_constraintdef(c.oid) as definition
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'users'::regclass AND n.nspname = 'public'
  `);
  console.log('Constraints:', JSON.stringify(constraints, null, 2));

  const indexes: any[] = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'users' AND schemaname = 'public'
  `);
  console.log('Indexes:', JSON.stringify(indexes, null, 2));
  
  const cols: any[] = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_generated
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('Columns:', JSON.stringify(cols, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
