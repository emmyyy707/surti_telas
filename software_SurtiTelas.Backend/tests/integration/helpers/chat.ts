import request from 'supertest';
import { prisma } from '@/config/database';
import bcrypt from 'bcryptjs';

let cachedToken: string | null = null;

export async function ensureAdminExists() {
  const email = 'admin@surtitelas.com';
  const password = 'SurtiTelas2025*';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      nombre: 'Admin SurtiTelas',
      passwordHash,
      role: 'ADMIN',
      estado: 'ACTIVO',
    },
  });
}

export async function getAuthToken(app: Express): Promise<string> {
  if (cachedToken) return cachedToken;

  await ensureAdminExists();

  const email = 'admin@surtitelas.com';
  const password = 'SurtiTelas2025*';

  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  cachedToken = response.body.data.accessToken;
  return cachedToken;
}

export async function authenticatedRequest(
  app: Express,
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  url: string,
  body?: unknown
) {
  const token = await getAuthToken(app);
  const req = request(app)[method](url);

  if (body) {
    req.send(body);
  }

  req.set('Authorization', `Bearer ${token}`);

  return req;
}

export async function ensureChatTestData() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', estado: 'ACTIVO' },
  });
  if (!admin) throw new Error('Admin user not found for chat tests');

  const client = await prisma.user.upsert({
    where: { email: 'chat-client@surtitelas.com' },
    update: {},
    create: {
      email: 'chat-client@surtitelas.com',
      nombre: 'Cliente Chat',
      passwordHash: await bcrypt.hash('cliente123', 10),
      role: 'CLIENTE',
      estado: 'ACTIVO',
    },
  });

  const advisor = await prisma.user.upsert({
    where: { email: 'chat-advisor@surtitelas.com' },
    update: {},
    create: {
      email: 'chat-advisor@surtitelas.com',
      nombre: 'Asesor Chat',
      passwordHash: await bcrypt.hash('asesor123', 10),
      role: 'ASESOR',
      estado: 'ACTIVO',
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { id: 'chat-test-conversation' },
    update: {},
    create: {
      id: 'chat-test-conversation',
      clientId: client.id,
      advisorId: advisor.id,
      status: 'OPEN',
      subject: 'Prueba chat',
    },
  });

  await prisma.message.deleteMany({
    where: { conversationId: conversation.id },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: client.id,
      senderRole: 'CLIENTE',
      content: 'Hola, necesito ayuda',
      messageType: 'text',
      status: 'sent',
    },
  });

  return {
    admin,
    client,
    advisor,
    conversation,
  };
}
