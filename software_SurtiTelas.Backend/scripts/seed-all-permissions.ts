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
    console.log(`ASIGNADO ${permissionId} -> ${role}`);
  }
}

async function main() {
  const permissions = [
    { code: 'receipts:read', description: 'Ver recibos', module: 'receipts' },
    { code: 'receipts:create', description: 'Emitir recibos', module: 'receipts' },
    { code: 'alerts:read', description: 'Ver alertas', module: 'alerts' },
    { code: 'alerts:create', description: 'Crear alertas', module: 'alerts' },
    { code: 'alerts:update', description: 'Gestionar alertas', module: 'alerts' },
    { code: 'notifications:read', description: 'Ver notificaciones', module: 'notifications' },
    { code: 'notifications:update', description: 'Gestionar notificaciones', module: 'notifications' },
  ];

  const created = await Promise.all(
    permissions.map((p) => ensurePermission(p.code, p.description, p.module))
  );

  for (const perm of created) {
    await assignIfMissing('ADMIN', perm.id);
    await assignIfMissing('ASESOR', perm.id);
    await assignIfMissing('CLIENTE', perm.id);
  }

  console.log('SEED_ALL_PERMS_OK');
}

main().catch((e) => {
  console.error('SEED_ALL_PERMS_ERROR', e.message);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
