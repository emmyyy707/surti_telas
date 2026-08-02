const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const cols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'deliveries' AND column_name IN ('lat', 'lng', 'latitude', 'longitude') 
      ORDER BY column_name
    `;
    console.log('Delivery location cols:', JSON.stringify(cols, null, 2));

    const orderCols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name IN ('lat', 'lng', 'latitude', 'longitude') 
      ORDER BY column_name
    `;
    console.log('Order location cols:', JSON.stringify(orderCols, null, 2));

    const delivery = await prisma.delivery.findFirst({
      where: { id: 'cmsbzc66t0001iggwl77qvx5g' },
      select: { id: true, direccion: true, ciudad: true, telefono: true, domiciliarioId: true },
    });
    console.log('Delivery:', JSON.stringify(delivery, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
