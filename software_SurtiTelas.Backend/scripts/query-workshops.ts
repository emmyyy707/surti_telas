import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.workshop.findMany({
    select: {
      id: true,
      nombre: true,
      direccion: true,
      ciudad: true,
      telefono: true,
      email: true,
      estado: true,
      capacidad: true,
      ocupacion: true,
    },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
