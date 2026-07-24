import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ 
      select: { id: true },
      where: { deletedAt: null }
    });
    console.log('Users with select:', users.map(u => u.id));
  } catch (e: any) {
    console.error('Error:', e.message, e.meta);
  }
  
  try {
    const users = await prisma.user.findMany({ 
      select: { id: true, email: true }
    });
    console.log('Users with select email:', users.map(u => u.email));
  } catch (e: any) {
    console.error('Error2:', e.message, e.meta);
  }
  
  await prisma.$disconnect();
}

main();
