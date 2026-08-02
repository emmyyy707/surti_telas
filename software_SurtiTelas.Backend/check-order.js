const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.order.findFirst({
      where: { id: 'cmsbxmjbi005qiga4fcgb45d5', deletedAt: null },
      include: {
        cliente: { select: { nombre: true, telefono: true, ciudad: true } },
      },
      select: {
        id: true,
        numero: true,
        clienteNombre: true,
        total: true,
        cliente: { select: { nombre: true, telefono: true, ciudad: true } },
      },
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
