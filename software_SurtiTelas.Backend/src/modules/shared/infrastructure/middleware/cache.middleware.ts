import { Request, Response, NextFunction, RequestHandler } from 'express';
import { redisClient } from '../../../../config/redis';
import { logger } from '../../../../shared/infrastructure/logger';

export const cacheMiddleware = (ttlSeconds?: number): RequestHandler => {
  const ttl = ttlSeconds ?? 300;
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = 'cache:' + req.method + ':' + req.originalUrl;
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.json(JSON.parse(cached));
        return;
      }
    } catch (err) {
      logger.warn('[Cache] Redis read failed', { error: (err as Error).message });
    }
    const originalJson = res.json.bind(res);
    (res.json as (body: unknown) => unknown) = (body: unknown): unknown => {
      res.setHeader('X-Cache', 'MISS');
      if (res.statusCode === 200) {
        void redisClient.setEx(key, ttl, JSON.stringify(body)).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};
