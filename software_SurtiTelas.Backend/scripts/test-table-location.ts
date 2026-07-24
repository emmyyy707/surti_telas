import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_name = 'users'
  `);
  console.log('Users table location:', JSON.stringify(result));
  
  const cols = await prisma.$queryRawUnsafe(`
    SELECT table_schema, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY table_schema, ordinal_position
  `);
  console.log('Users columns:', JSON.stringify(cols));
  
  await prisma.$disconnect();
}

main();
