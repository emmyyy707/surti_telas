import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderId = 'cmt0pg838000migw00ifp7uzi';
  
  const order = await prisma.custom_orders.findUnique({
    where: { id: orderId },
    include: { quotes: true },
  });

  console.log('Order estado:', order?.estado);
  console.log('Quote estado:', order?.quotes?.estado);
  console.log('Quote valorAnticipo:', order?.quotes?.valor_anticipo);
  console.log('Quote saldo:', order?.quotes?.saldo);
  console.log('Quote total:', order?.quotes?.total);
  console.log('Quote porcentajeAnticipo:', order?.quotes?.porcentaje_anticipo);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
