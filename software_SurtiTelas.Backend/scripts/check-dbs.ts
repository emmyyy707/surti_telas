import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dbs: any[] = await prisma.$queryRawUnsafe(`SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`);
  console.log('Databases:', JSON.stringify(dbs));
  
  const users: any[] = await prisma.$queryRawUnsafe(`SELECT usename FROM pg_user ORDER BY usename`);
  console.log('Users:', JSON.stringify(users));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
