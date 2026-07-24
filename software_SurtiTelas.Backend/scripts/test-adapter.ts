import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/surtitelas?schema=public'
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const usuario = await prisma.usuario.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('Usuario found:', usuario?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
