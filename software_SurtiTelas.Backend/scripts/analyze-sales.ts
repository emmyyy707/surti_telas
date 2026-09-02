import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    where: { deletedAt: null },
    include: {
      order: {
        select: {
          estado: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const estadoCounts: Record<string, number> = {};
  for (const sale of sales) {
    const estado = sale.order?.estado ?? 'SIN_ORDER';
    estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
  }

  console.log('Order estado distribution among recent sales:');
  for (const [estado, count] of Object.entries(estadoCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${estado}: ${count}`);
  }

  const cancelable = sales.filter(s => {
    const estado = s.order?.estado;
    const cancelableStates = ['NUEVO', 'PENDIENTE', 'EN_VALIDACION', 'ACEPTADO', 'EN_PRODUCCION', 'LISTO', 'DESPACHADO', 'EN_CAMINO', 'RECIBO_GENERADO', 'RECIBO_ENVIADO'];
    return estado && cancelableStates.includes(estado);
  });

  console.log('\nCancelable sales:', cancelable.length);
  for (const sale of cancelable) {
    console.log(`  ${sale.id} -> order.estado=${sale.order?.estado}`);
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
