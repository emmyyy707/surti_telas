import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst({
    where: { id: 'cmsc83k930004igh47gz6ol6m', deletedAt: null },
    select: { id: true, numero: true, estado: true, domiciliarioId: true, clienteId: true, cliente: true, asesorId: true, asesor: true, total: true },
  });
  console.log(JSON.stringify(order, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
