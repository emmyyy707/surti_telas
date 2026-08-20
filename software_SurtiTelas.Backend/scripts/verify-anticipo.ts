import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Use the existing order from test-first-save.ts
  const orderId = 'cmt0pg838000migw00ifp7uzi';
  
  const order = await prisma.custom_orders.findUnique({
    where: { id: orderId },
    include: { quotes: true },
  });

  console.log('=== ESTADO ACTUAL EN DB ===');
  console.log('Order estado:', order?.estado);
  console.log('Quote estado:', order?.quotes?.estado);
  console.log('Quote valorAnticipo:', order?.quotes?.valor_anticipo);
  console.log('Quote saldo:', order?.quotes?.saldo);
  console.log('Quote total:', order?.quotes?.total);
  console.log('Quote porcentajeAnticipo:', order?.quotes?.porcentaje_anticipo);

  // Check if valorAnticipo is correct
  const total = Number(order?.quotes?.total || 0);
  const porcentajeAnticipo = Number(order?.quotes?.porcentaje_anticipo || 50);
  const expectedValorAnticipo = Number((total * (porcentajeAnticipo / 100)).toFixed(2));
  const expectedSaldo = Number((total - expectedValorAnticipo).toFixed(2));

  console.log('\n=== VALORES ESPERADOS ===');
  console.log('Total:', total);
  console.log('Porcentaje anticipo:', porcentajeAnticipo);
  console.log('Valor anticipo esperado:', expectedValorAnticipo);
  console.log('Saldo esperado:', expectedSaldo);

  console.log('\n=== RESULTADO ===');
  if (order?.quotes?.valor_anticipo === expectedValorAnticipo && order?.quotes?.saldo === expectedSaldo) {
    console.log('✅ Valor anticipo y saldo correctos en DB');
  } else {
    console.log('❌ Valor anticipo o saldo incorrectos en DB');
    console.log('  DB valorAnticipo:', order?.quotes?.valor_anticipo, 'esperado:', expectedValorAnticipo);
    console.log('  DB saldo:', order?.quotes?.saldo, 'esperado:', expectedSaldo);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
