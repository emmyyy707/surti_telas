const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: { deletedAt: null },
      include: {
        order: { select: { id: true, numero: true, estado: true } },
        domiciliario: { select: { id: true, nombre: true, email: true } },
      },
    });

    console.log('Deliveries totales:', deliveries.length);
    for (const d of deliveries) {
      console.log(JSON.stringify({
        id: d.id,
        orderId: d.orderId,
        estado: d.estado,
        domiciliarioId: d.domiciliarioId,
        domiciliarioNombre: d.domiciliario?.nombre,
        domiciliarioEmail: d.domiciliario?.email,
        orderNumero: d.order?.numero,
      }, null, 2));
    }

    const user = await prisma.user.findFirst({
      where: { role: 'DOMICILIARIO', deletedAt: null },
      select: { id: true, nombre: true, email: true },
    });
    console.log('Domiciliario en DB:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
