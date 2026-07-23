import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, email: true, nombre: true, role: true, estado: true, passwordHash: true },
  });

  console.log('=== USUARIOS EN LA BD ===');
  for (const u of users) {
    console.log(`- ${u.email} | role=${u.role} | estado=${u.estado} | nombre=${u.nombre}`);
  }

  console.log('\n=== CREDENCIALES POR DEFECTO (seed) ===');
  console.log('ADMIN: admin@surtitelas.com / SurtiTelas2025*');
  console.log('ASESOR: asesor@surtitelas.com / SurtiTelas2025*');
  console.log('\nNota: el seed crea estos usuarios solo si no existen. Si ya existían con otra contraseña, el hash no se actualiza.');
}

main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
