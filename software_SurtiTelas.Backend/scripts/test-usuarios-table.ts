import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nombre TEXT NOT NULL,
      telefono TEXT,
      direccion TEXT,
      role TEXT NOT NULL,
      estado TEXT DEFAULT 'ACTIVO',
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP
    )
  `);
  
  try {
    const usuario = await prisma.usuario.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('Usuario found:', usuario?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  }
  
  await prisma.$disconnect();
}

main();
