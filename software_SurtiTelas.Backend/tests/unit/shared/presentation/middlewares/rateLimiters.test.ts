import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sensitiveUserRateLimiter } from '@/modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import { redisUserRateLimiter } from '@/modules/shared/presentation/middlewares/redisUserRateLimiter';

vi.mock('@/config/redis', () => ({
  redisClient: {
    isReady: true,
    sendCommand: vi.fn(),
  },
}));

import { redisClient } from '@/config/redis';

beforeEach(() => {
  vi.clearAllMocks();
  (redisClient.isReady as any) = true;
});

describe('sensitiveUserRateLimiter', () => {
  it('should allow request when not in test mode and Redis is ready', async () => {
    (redisClient.sendCommand as any).mockResolvedValue(1);
    const req = { user: { id: 'user-1' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await sensitiveUserRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow request in test mode', async () => {
    process.env.NODE_ENV = 'test';
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    await sensitiveUserRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    delete process.env.NODE_ENV;
  });

  it('should allow request when DISABLE_RATE_LIMIT is true', async () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    await sensitiveUserRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    delete process.env.DISABLE_RATE_LIMIT;
  });

  it('should reject request when Redis is not ready', async () => {
    (redisClient.isReady as any) = false;
    const req = {} as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any;
    const next = vi.fn();

    await sensitiveUserRateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'service_unavailable',
      message: 'Servicio temporalmente no disponible. Intenta de nuevo más tarde.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should block request when rate limit is exceeded', async () => {
    (redisClient.sendCommand as any).mockResolvedValue(0);
    const req = { user: { id: 'user-1' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any;
    const next = vi.fn();

    await sensitiveUserRateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('redisUserRateLimiter', () => {
  it('should allow request when not in test mode and Redis is ready', async () => {
    process.env.NODE_ENV = 'development';
    (redisClient.sendCommand as any).mockResolvedValue(1);
    const req = { user: { id: 'user-1' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await redisUserRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject request when Redis is not ready', async () => {
    (redisClient.isReady as any) = false;
    const req = {} as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any;
    const next = vi.fn();

    await redisUserRateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'service_unavailable',
      message: 'Servicio temporalmente no disponible. Intenta de nuevo más tarde.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow request in test mode', async () => {
    process.env.NODE_ENV = 'test';
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    await redisUserRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    delete process.env.NODE_ENV;
  });
});
