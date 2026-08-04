import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const asesor = await prisma.user.findFirst({
    where: { role: 'ASESOR', deletedAt: null },
    select: { id: true, email: true, nombre: true },
  });
  console.log('Asesor encontrado:', JSON.stringify(asesor, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
