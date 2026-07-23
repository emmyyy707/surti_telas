import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const views: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name, view_definition
    FROM information_schema.views
    WHERE table_schema = 'public'
  `);
  console.log('Views:', JSON.stringify(views, null, 2));
  
  const rules: any[] = await prisma.$queryRawUnsafe(`
    SELECT rulename, definition
    FROM pg_rules
    WHERE schemaname = 'public'
  `);
  console.log('Rules:', JSON.stringify(rules, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
