import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissionCode = 'notifications:read';
  const roles: Role[] = ['CLIENTE', 'ASESOR'];

  const permission = await prisma.permission.findUnique({ where: { code: permissionCode } });
  if (!permission) {
    await prisma.permission.create({
      data: { code: permissionCode, description: 'Ver notificaciones', module: 'notifications' },
    });
  }

  const perm = await prisma.permission.findUnique({ where: { code: permissionCode } });
  if (!perm) {
    console.log('No se pudo obtener el permiso creado.');
    return;
  }

  for (const role of roles) {
    const exists = await prisma.rolePermission.findUnique({
      where: { role_permissionId: { role, permissionId: perm.id } },
    });

    if (!exists) {
      await prisma.rolePermission.create({ data: { role, permissionId: perm.id } });
      console.log(`ASIGNADO ${permissionCode} -> ${role}`);
    } else {
      console.log(`YA EXISTE ${permissionCode} -> ${role}`);
    }
  }

  for (const role of roles) {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
    console.log(`Permisos actuales del rol ${role}:`);
    rolePerms.forEach(rp => console.log(` - ${rp.permission.code}`));
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
