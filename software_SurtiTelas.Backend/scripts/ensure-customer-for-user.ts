import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'cliente@surtitelas.com', role: 'CLIENTE' },
  });

  if (!user) {
    console.log('Usuario cliente no encontrado');
    return;
  }

  const existing = await prisma.customer.findFirst({
    where: { email: user.email },
  });

  if (!existing) {
    console.log('Customer no encontrado, creando...');
    const asesor = await prisma.user.findFirst({
      where: { role: 'ASESOR' },
    });

    const customer = await prisma.customer.create({
      data: {
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        ciudad: user.direccion ?? undefined,
        nit: user.numeroDocumento ?? undefined,
        asesorId: asesor?.id ?? undefined,
         cupoTotal: 1000000,
         cupoUsado: 0,
        deudaVencida: 0,
        isTrustedCustomer: false,
        estado: 'ACTIVO',
      },
    });

    console.log('Customer creado:', customer.id, 'Asesor:', asesor?.id ?? 'sin asesor');
    return;
  }

  if (!existing.asesorId) {
    const asesor = await prisma.user.findFirst({
      where: { role: 'ASESOR' },
    });

    const updated = await prisma.customer.update({
      where: { id: existing.id },
      data: {
        asesorId: asesor?.id ?? undefined,
      },
    });

    console.log('Customer actualizado con asesor:', updated.id, 'Asesor:', asesor?.id ?? 'sin asesor');
  } else {
    console.log('Customer ya tiene asesor:', existing.id, 'Asesor:', existing.asesorId);
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
