import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:12345@localhost:5432/surtitelas_dev?schema=public'
      }
    }
  });

  try {
    const cols: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('surtitelas_dev users columns:', cols.map(c => c.column_name).join(', '));
  } catch (e) {
    console.error('Error connecting to surtitelas_dev:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
