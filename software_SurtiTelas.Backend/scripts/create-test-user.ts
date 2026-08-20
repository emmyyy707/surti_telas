import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'testprueba@surtitelas.com';
  const password = 'Test123456!';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, estado: 'ACTIVO', role: 'CLIENTE' },
    create: { email, nombre: 'Cliente Prueba', passwordHash: hash, estado: 'ACTIVO', role: 'CLIENTE' }
  });

  console.log('Usuario creado/actualizado:', user.email, password);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
