import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enums = await prisma.$queryRawUnsafe(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY t.typname, e.enumsortorder
  `);
  console.log('Enums:', JSON.stringify(enums, null, 2));
  
  await prisma.$disconnect();
}

main();
