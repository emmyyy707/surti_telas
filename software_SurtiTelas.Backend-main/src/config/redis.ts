import { createClient, type RedisClientType } from 'redis';
import { env } from './env';
import { logger } from '../shared/infrastructure/logger';

export type AppRedisClient = RedisClientType<Record<string, never>, Record<string, never>, Record<string, never>, 2>;

export const redisClient = createClient({
  url: env.REDIS_URL,
  RESP: 2,
  disableClientInfo: true,
}) as AppRedisClient;

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export async function connectRedis(): Promise<void> {
  if (redisClient.isReady) {
    return;
  }

  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis', { error: (err as Error).message });
  }
}

export default redisClient;
