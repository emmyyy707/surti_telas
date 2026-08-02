const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.order.update({
      where: { id: 'cmsbxmjbi005qiga4fcgb45d5' },
      data: { estado: 'ENTREGADO' },
      include: {
        cliente: true,
        asesor: true,
        usuarioValidacion: true,
        comprobantePagoCargadoPor: true,
        items: true,
      },
    });
    console.log('Update OK:', JSON.stringify({ id: result.id, estado: result.estado }, null, 2));
  } catch (error) {
    console.error('Prisma update error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
