import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customersRead = await prisma.permission.findUnique({ where: { code: 'customers:read' } });
  const customersCreate = await prisma.permission.findUnique({ where: { code: 'customers:create' } });
  const customersUpdate = await prisma.permission.findUnique({ where: { code: 'customers:update' } });

  if (!customersRead || !customersCreate || !customersUpdate) {
    throw new Error('Permisos de customers no encontrados');
  }

  const roles: Role[] = ['ADMIN', 'ASESOR', 'CLIENTE'];
  for (const role of roles) {
    const existing = await prisma.rolePermission.findFirst({
      where: { role, permissionId: customersRead.id },
    });
    if (!existing) {
      await prisma.rolePermission.create({ data: { role, permissionId: customersRead.id } });
      console.log(`ASIGNADO customers:read -> ${role}`);
    }

    const existingCreate = await prisma.rolePermission.findFirst({
      where: { role, permissionId: customersCreate.id },
    });
    if (!existingCreate) {
      await prisma.rolePermission.create({ data: { role, permissionId: customersCreate.id } });
      console.log(`ASIGNADO customers:create -> ${role}`);
    }

    const existingUpdate = await prisma.rolePermission.findFirst({
      where: { role, permissionId: customersUpdate.id },
    });
    if (!existingUpdate) {
      await prisma.rolePermission.create({ data: { role, permissionId: customersUpdate.id } });
      console.log(`ASIGNADO customers:update -> ${role}`);
    }
  }

  console.log('SEED_CUSTOMERS_PERMS_OK');
}

main().catch((e) => {
  console.error('SEED_CUSTOMERS_PERMS_ERROR', e.message);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
