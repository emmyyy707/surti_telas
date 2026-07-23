import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function ensurePermission(code: string, description: string, module: string) {
  const existing = await prisma.permission.findUnique({ where: { code } });
  if (existing) return existing;
  return prisma.permission.create({ data: { code, description, module } });
}

async function assignIfMissing(role: Role, permissionId: string) {
  const exists = await prisma.rolePermission.findUnique({
    where: { role_permissionId: { role, permissionId } },
  });
  if (!exists) {
    await prisma.rolePermission.create({ data: { role, permissionId } });
  }
}

async function main() {
  const customersRead = await ensurePermission('customers:read', 'Listar clientes', 'customers');
  const customersCreate = await ensurePermission('customers:create', 'Crear clientes', 'customers');
  const customersUpdate = await ensurePermission('customers:update', 'Actualizar clientes', 'customers');

  await assignIfMissing('ADMIN', customersRead.id);
  await assignIfMissing('ADMIN', customersCreate.id);
  await assignIfMissing('ADMIN', customersUpdate.id);

  await assignIfMissing('ASESOR', customersRead.id);
  await assignIfMissing('ASESOR', customersCreate.id);
  await assignIfMissing('ASESOR', customersUpdate.id);

  console.log('SEED_PERMISSIONS_OK');
}

main().catch((e) => {
  console.error('SEED_PERMISSIONS_ERROR', e.message);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
