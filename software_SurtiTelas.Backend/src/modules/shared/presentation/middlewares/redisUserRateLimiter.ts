import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../../../config/redis';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = redis.call("GET", key)
  if current and tonumber(current) >= limit then
    return 0
  end
  redis.call("INCR", key)
  if redis.call("TTL", key) == -1 then
    redis.call("EXPIRE", key, window)
  end
  return 1
`;

export async function redisUserRateLimiter(req: Request, res: Response, next: NextFunction) {
  if (process.env.DISABLE_RATE_LIMIT === 'true' || !redisClient.isReady) {
    return next();
  }

  const userId = req.user?.id || req.ip || 'anonymous';
  const key = `ratelimit:user:${userId}`;
  const windowSeconds = Math.ceil(WINDOW_MS / 1000);

  try {
    const result = (await redisClient.sendCommand([
      'EVAL',
      RATE_LIMIT_SCRIPT,
      String(1),
      String(key),
      String(MAX_REQUESTS),
      String(windowSeconds),
    ])) as number;

    if (result === 0) {
      return res.status(429).json({
        success: false,
        error: 'too_many_requests',
        message: 'Límite de solicitudes excedido. Intenta más tarde.',
      });
    }

    next();
  } catch {
    next();
  }
}
