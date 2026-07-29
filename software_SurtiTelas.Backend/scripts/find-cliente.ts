import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { role: 'CLIENTE', deletedAt: null },
    select: { id: true, email: true, nombre: true },
  });
  console.log('Cliente:', user || 'No encontrado');
  await prisma.$disconnect();
}

main().catch(console.error);
