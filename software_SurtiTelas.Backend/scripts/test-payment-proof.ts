import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a minimal fake JPG file (1x1 pixel)
  const fakeImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const orderId = 'cmt0ret7v0001ig901qlge4rn';
  const clientEmail = 'clientetest@surtitelas.com';
  const clientPassword = 'ClienteTest123!';

  // Login as client
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password: clientPassword }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;
  console.log('Login:', loginRes.status, !!token);

  // Upload payment proof
  const form = new FormData();
  const file = new File([fakeImage], 'comprobante.jpg', { type: 'image/jpeg' });
  form.append('paymentProof', file);

  const uploadRes = await fetch(`http://localhost:3000/api/v1/custom-orders/${orderId}/payment-proof`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploadJson = await uploadRes.json();
  console.log('Upload payment proof:', uploadRes.status, JSON.stringify(uploadJson, null, 2));

  if (!uploadRes.ok) {
    console.log('UPLOAD FAILED');
    await prisma.$disconnect();
    return;
  }

  // Update payment status
  const patchRes = await fetch(`http://localhost:3000/api/v1/custom-orders/${orderId}/payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentProofUrl: uploadJson.data.paymentProofUrl,
      paymentStatus: 'PENDING',
    }),
  });
  const patchJson = await patchRes.json();
  console.log('Update payment:', patchRes.status, JSON.stringify(patchJson, null, 2));

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
