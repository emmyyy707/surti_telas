import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissionCode = 'favorites:read';
  const roles: Role[] = ['CLIENTE'];

  const permission = await prisma.permission.findUnique({ where: { code: permissionCode } });
  if (!permission) {
    await prisma.permission.create({
      data: { code: permissionCode, description: 'Ver favoritos', module: 'favorites' },
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
