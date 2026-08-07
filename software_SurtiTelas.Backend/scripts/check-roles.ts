import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  console.log('=== Verificando roles en roleConfig ===');
  const roleConfigs = await prisma.roleConfig.findMany();
  console.log('Roles en roleConfig:', roleConfigs.map(r => ({ role: r.role, estado: r.estado, descripcion: r.descripcion })));
  
  console.log('\n=== Verificando si R-asd existe ===');
  const roleName = 'asd';
  const roleConfig = await prisma.roleConfig.findUnique({
    where: { role: roleName },
  });
  console.log('RoleConfig para "asd":', roleConfig);
  
  console.log('\n=== Verificando usuarios con rol "asd" ===');
  const usersWithRole = await prisma.user.findMany({
    where: { role: roleName },
    select: { id: true, email: true, role: true }
  });
  console.log('Usuarios con rol "asd":', usersWithRole);
  
  await prisma.$disconnect();
}

main().catch(console.error);
