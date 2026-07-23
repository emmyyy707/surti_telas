import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  }
}

main();
