import request from 'supertest';
import { prisma } from '@/config/database';
import bcrypt from 'bcryptjs';

let cachedToken: string | null = null;

export async function ensureAdminExists() {
  const email = 'admin@surtitelas.com';
  const password = 'SurtiTelas2025*';

  const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        nombre: 'Admin SurtiTelas',
        passwordHash,
        role: 'ADMIN',
        estado: 'ACTIVO',
      },
    });
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
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
