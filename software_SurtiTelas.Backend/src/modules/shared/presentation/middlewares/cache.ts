import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../../../config/redis';
import { logger } from '../../../../shared/infrastructure/logger';

export async function cacheMiddleware(ttlMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!redisClient.isReady) {
        return next();
      }

      const key = `cache:${req.method}:${req.originalUrl}`;
      const cached = await redisClient.get(key);

      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        redisClient.setEx(key, Math.floor(ttlMs / 1000), JSON.stringify(body)).catch(() => {});
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error, continuing without cache', { error: (error as Error).message });
      next();
    }
  };
}

export async function clearCache(pattern?: string) {
  try {
    if (!redisClient.isReady) return;

    const scanPattern = pattern ? `cache:*${pattern}*` : 'cache:*';
    const keys: string[] = [];
    let cursor = '0';

    do {
      const result = (await redisClient.sendCommand(['SCAN', cursor, 'MATCH', scanPattern, 'COUNT', '100'])) as [string, string[]];
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Error clearing cache', { error: (error as Error).message });
  }
}
