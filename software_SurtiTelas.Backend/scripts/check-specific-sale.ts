import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const saleId = 'cmthpm7sd001aiglcoij1pllx';
  const sale = await prisma.sale.findFirst({
    where: { id: saleId, deletedAt: null },
    include: {
      order: {
        select: {
          id: true,
          numero: true,
          estado: true,
          tipoFlujo: true,
        },
      },
    },
  });

  if (!sale) {
    console.log('Sale not found:', saleId);
    return;
  }

  console.log('=== SALE ===');
  console.log('id:', sale.id);
  console.log('orderId:', sale.orderId);
  console.log('estado:', sale.estado);
  console.log('motivoAnulacion:', sale.motivoAnulacion);
  console.log('medioPago:', sale.medioPago);
  console.log('deletedAt:', sale.deletedAt);
  console.log('createdAt:', sale.createdAt);
  console.log('');
  console.log('=== ORDER ===');
  if (sale.order) {
    console.log('id:', sale.order.id);
    console.log('numero:', sale.order.numero);
    console.log('estado:', sale.order.estado);
    console.log('tipoFlujo:', sale.order.tipoFlujo);
  } else {
    console.log('No order relation loaded');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
