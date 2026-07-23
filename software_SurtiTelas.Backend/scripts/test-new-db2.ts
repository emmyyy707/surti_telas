import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:12345@localhost:5432/surtitelas2?schema=public'
    }
  }
});

async function main() {
  try {
    await prisma.$connect();
    
    // Create tables manually
    await prisma.$executeRawUnsafe(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nombre TEXT NOT NULL,
        telefono TEXT,
        role TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
    
    const user = await prisma.user.findFirst({ 
      where: { email: 'test@test.com' }
    });
    console.log('User found:', user?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
