import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/surtitelas?schema=public'
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  // Use a minimal inline schema for the client
});

async function main() {
  await prisma.$connect();
  
  // Create a minimal table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios_test (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL
    )
  `);
  
  try {
    const result = await pool.query('SELECT * FROM usuarios_test LIMIT 1');
    console.log('Raw query works:', result.rows.length);
  } catch (e) {
    console.error('Raw query error:', e);
  }
  
  try {
    const usuario = await prisma.usuario.findFirst({ 
      where: { email: 'test@test.com' }
    });
    console.log('Usuario found:', usuario?.email);
  } catch (e: any) {
    console.error('Prisma Error:', e.message, e.meta);
  }
  
  await prisma.$disconnect();
  await pool.end();
}

main();
