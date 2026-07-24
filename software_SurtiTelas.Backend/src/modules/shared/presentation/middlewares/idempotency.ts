import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../../../config/redis';
import { logger } from '../../../../shared/infrastructure/logger';

const IDEMPOTENCY_TTL = 24 * 60 * 60;
const MAX_CACHE_SIZE = 1024 * 1024;

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true' || !redisClient.isReady) {
    return next();
  }

  const key = req.get('Idempotency-Key');
  if (!key || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const cacheKey = `idempotency:${key}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(parsed.status).json(parsed.body);
    }
  } catch (error) {
    logger.error('Idempotency check failed', { error: (error as Error).message });
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    if (res.statusCode < 400) {
      const payload = JSON.stringify({ status: res.statusCode, body });
      if (payload.length <= MAX_CACHE_SIZE) {
        redisClient.setEx(cacheKey, IDEMPOTENCY_TTL, payload).catch((err) => {
          logger.error('Idempotency cache failed', { error: (err as Error).message });
        });
      }
    }
    return originalJson(body);
  };

  next();
}
