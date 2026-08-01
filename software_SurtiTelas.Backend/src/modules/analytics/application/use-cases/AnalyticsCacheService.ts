import { redisClient } from '../../../../config/redis';
import { logger } from '../../../../shared/infrastructure/logger';

const CACHE_PREFIX = 'analytics:';
const DEFAULT_TTL = 300;

export class AnalyticsCacheService {
  async get(key: string): Promise<unknown> {
    try {
      const cached = await redisClient.get(`${CACHE_PREFIX}${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await redisClient.setEx(`${CACHE_PREFIX}${key}`, ttl, JSON.stringify(value));
    } catch (err) {
      logger.warn('[AnalyticsCache] Redis set failed', { error: (err as Error).message });
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(`${CACHE_PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch {
      // Ignore cache invalidation errors
    }
  }
}
