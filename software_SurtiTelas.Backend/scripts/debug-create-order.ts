import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const p = new PrismaClient();

async function main() {
  const user = await p.user.findUnique({ where: { email: 'cliente@surtitelas.com' } });
  if (!user) {
    console.log('Usuario no encontrado');
    await p.$disconnect();
    return;
  }

  const customer = await p.customer.findFirst({ where: { email: user.email } });
  if (!customer) {
    console.log('Customer no encontrado');
    await p.$disconnect();
    return;
  }

  const asesor = await p.user.findFirst({ where: { role: 'ASESOR', deletedAt: null } });
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    'test-secret',
    { expiresIn: '1h' }
  );

  const payload = {
    clienteId: customer.id,
    asesorId: asesor?.id,
    itemsList: [{ nombre: 'Camiseta test', precio: 25000, cantidad: 1 }],
    observaciones: 'Test debug',
    paymentMethod: 'TRANSFER',
  };

  console.log('TEST_PAYLOAD', JSON.stringify(payload));

  try {
    const res = await fetch('http://localhost:3000/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log('TEST_STATUS', res.status);
    console.log('TEST_BODY', text);
  } catch (e) {
    console.log('TEST_FETCH_ERROR', e);
  } finally {
    await p.$disconnect();
  }
}

main();
