import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domiciliario = await prisma.user.findFirst({
    where: { role: 'DOMICILIARIO', deletedAt: null },
    select: { id: true, nombre: true, email: true },
  });

  if (!domiciliario) {
    console.log('No se encontró un domiciliario en la base de datos');
    return;
  }

  const customer = await prisma.customer.findFirst({
    select: { id: true, nombre: true },
  });

  const asesor = await prisma.user.findFirst({
    where: { role: 'ASESOR', deletedAt: null },
    select: { id: true, nombre: true },
  });

  if (!customer || !asesor) {
    console.log('Faltan customer/asesor para crear órdenes de ejemplo');
    return;
  }

  const estado = ['ASIGNADO', 'EN_RUTA', 'ENTREGADO', 'FALLIDO'] as const;
  const deliveries = [
    {
      orderNumero: `PED-${Date.now().toString().slice(-6)}-1`,
      estado: estado[0],
      direccion: 'Calle 29-120 Cr 80',
      ciudad: 'Medellín',
      telefono: '+573020629030',
      notas: 'Entregar antes de las 12:00',
      asignadoEn: new Date(),
    },
    {
      orderNumero: `PED-${Date.now().toString().slice(-6)}-2`,
      estado: estado[1],
      direccion: 'Calle 10-45 Cr 50',
      ciudad: 'Medellín',
      telefono: '+573021234567',
      notas: 'Dejar en portería',
      asignadoEn: new Date(),
    },
    {
      orderNumero: `PED-${Date.now().toString().slice(-6)}-3`,
      estado: estado[2],
      direccion: 'Calle 5-20 Cr 30',
      ciudad: 'Medellín',
      telefono: '+573022345678',
      notas: 'Entregado en mano',
      asignadoEn: new Date(),
      entregadoEn: new Date(),
    },
    {
      orderNumero: `PED-${Date.now().toString().slice(-6)}-4`,
      estado: estado[3],
      direccion: 'Calle 15-60 Cr 90',
      ciudad: 'Medellín',
      telefono: '+573023456789',
      notas: 'Cliente no estaba',
      asignadoEn: new Date(),
    },
  ];

  for (const d of deliveries) {
    const order = await prisma.order.create({
      data: {
        numero: d.orderNumero,
        clienteId: customer.id,
        clienteNombre: customer.nombre,
        asesorId: asesor.id,
        asesorNombre: asesor.nombre,
        total: 100000,
      },
      select: { id: true },
    });

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        domiciliarioId: domiciliario.id,
        estado: d.estado,
        direccion: d.direccion,
        ciudad: d.ciudad,
        telefono: d.telefono,
        notas: d.notas,
        asignadoEn: d.asignadoEn,
        entregadoEn: d.entregadoEn,
      },
    });
  }

  const count = await prisma.delivery.count({ where: { domiciliarioId: domiciliario.id } });
  console.log(`Se crearon ${deliveries.length} entregas para el domiciliario ${domiciliario.nombre} (${domiciliario.email}). Total en BD: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
