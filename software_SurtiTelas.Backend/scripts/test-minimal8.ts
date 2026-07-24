import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const usuarios = await prisma.usuarios.findFirst({ 
      where: { email: 'admin@surtitelas.com' }
    });
    console.log('Usuarios found:', usuarios?.email);
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
