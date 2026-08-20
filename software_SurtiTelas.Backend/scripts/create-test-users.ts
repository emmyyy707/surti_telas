import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const clientEmail = 'clientetest@surtitelas.com';
  const clientPassword = 'ClienteTest123!';
  const clientHash = await bcrypt.hash(clientPassword, 12);

  const adminEmail = 'admintest@surtitelas.com';
  const adminPassword = 'AdminTest123!';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: { passwordHash: clientHash, estado: 'ACTIVO', role: 'CLIENTE' },
    create: { email: clientEmail, nombre: 'Cliente Prueba', passwordHash: clientHash, estado: 'ACTIVO', role: 'CLIENTE' }
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, estado: 'ACTIVO', role: 'ADMIN' },
    create: { email: adminEmail, nombre: 'Admin Prueba', passwordHash: adminHash, estado: 'ACTIVO', role: 'ADMIN' }
  });

  console.log('CLIENTE:', client.email, '|', clientPassword);
  console.log('ADMIN:', admin.email, '|', adminPassword);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
