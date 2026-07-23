import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  
  const raw = await prisma.$queryRawUnsafe(`SELECT id, email FROM users LIMIT 5`);
  console.log('Raw query:', JSON.stringify(raw));
  
  const count = await prisma.$queryRawUnsafe(`SELECT count(*)::int as cnt FROM users`);
  console.log('Count raw:', JSON.stringify(count));
  
  await prisma.$disconnect();
}

main();
