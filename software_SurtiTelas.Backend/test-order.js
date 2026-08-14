const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customerId = 'cmss2ue2y0000igic02beyqz4';
  const asesorId = 'cmspfhn6p0019ig6sdf8le6ux';

  try {
    const order = await prisma.order.create({
      data: {
        numero: 'TEST-001',
        clienteId: customerId,
        clienteNombre: 'Test',
        asesorId: asesorId,
        asesorNombre: 'Test',
        tipoFlujo: 'PERSONALIZADO',
        total: 1000,
        itemsCount: 1,
        estado: 'NUEVO',
        prioridad: 'PRIORITARIO',
        items: {
          create: [
            {
              productId: null,
              nombre: 'Test item',
              precio: 1000,
              cantidad: 1,
            },
          ],
        },
      },
      select: { id: true, numero: true },
    });
    console.log('Order created:', JSON.stringify(order, null, 2));
  } catch (e) {
    console.error('Error creating order:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
