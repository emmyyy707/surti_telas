import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deliveries = await prisma.delivery.findMany({
    where: { orderId: 'cmsc83k930004igh47gz6ol6m', deletedAt: null },
    select: { id: true, estado: true, domiciliarioId: true, direccion: true, ciudad: true, telefono: true, asignadoEn: true, entregadoEn: true },
  });
  console.log('Deliveries para el pedido:');
  console.log(JSON.stringify(deliveries, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
