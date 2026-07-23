import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const searchPath: any = await prisma.$queryRawUnsafe(`SHOW search_path`);
  console.log('search_path:', JSON.stringify(searchPath));
  
  const schemas: any[] = await prisma.$queryRawUnsafe(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
  console.log('schemas:', JSON.stringify(schemas));
  
  const tablesInPrisma: any[] = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'prisma' AND table_type='BASE TABLE' ORDER BY table_name`);
  console.log('tables in prisma schema:', JSON.stringify(tablesInPrisma));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
