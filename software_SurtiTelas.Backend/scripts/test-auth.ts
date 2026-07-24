import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected');
    
    // Reproducir exactamente la llamada del backend
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@surtitelas.com',
        deletedAt: null,
      },
    });
    console.log('User:', user?.email);
    
    // También probar sin deletedAt
    const user2 = await prisma.user.findFirst({
      where: {
        email: 'admin@surtitelas.com',
      },
    });
    console.log('User2:', user2?.email);
    
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
