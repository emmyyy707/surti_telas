import type { DomainEvent, EventBus } from '../application/EventBus';
import { redisClient, type AppRedisClient } from '../../config/redis';
import { logger } from './logger';

type Handler = (event: DomainEvent) => Promise<void> | void;

export class RedisStreamEventBus implements EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private consumers = new Map<string, Promise<void>>();
  private redis: AppRedisClient;

  constructor(redis: AppRedisClient = redisClient) {
    this.redis = redis;
  }

  async publish(event: DomainEvent, requestId?: string): Promise<void> {
    const streamKey = `events:${event.type}`;
    try {
      await this.redis.xAdd(streamKey, '*', {
        type: event.type,
        payload: JSON.stringify(event.payload),
        occurredAt: event.occurredAt.toISOString(),
        requestId: requestId || event.requestId || '',
      });
    } catch (err) {
      logger.error(`[RedisStreamEventBus] Failed to publish event "${event.type}"`, { error: (err as Error).message });
    }
  }

  subscribe(type: string, handler: Handler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    if (!this.consumers.has(type)) {
      const consumerPromise = this.startConsumer(type);
      this.consumers.set(type, consumerPromise);
    }
  }

  private async startConsumer(type: string): Promise<void> {
    const streamKey = `events:${type}`;
    const groupName = `cg:${type}`;
    const consumerName = 'main';

    try {
      await this.redis.xGroupCreate(streamKey, groupName, '$', { MKSTREAM: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!errorMessage.includes('BUSYGROUP')) {
        logger.error(`[RedisStreamEventBus] Failed to create consumer group for "${type}"`, { error: errorMessage });
        return;
      }
    }

    logger.info(`[RedisStreamEventBus] Consumer started for "${type}"`);

    while (true) {
      try {
        const result = await this.redis.xReadGroup(
          groupName,
          consumerName,
          { key: streamKey, id: '>' },
          { COUNT: 1, BLOCK: 5000 }
        );

        if (result) {
          for (const entry of result) {
            const message = entry.messages[0];
            const event: DomainEvent = {
              type,
              payload: JSON.parse(message.message.payload as string),
              occurredAt: new Date(message.message.occurredAt as string),
              requestId: (message.message.requestId as string) || undefined,
            };

            const handlers = this.handlers.get(type);
            if (handlers) {
              for (const h of handlers) {
                try {
                  await Promise.resolve(h(event));
                } catch (handlerErr) {
                  logger.error(`[RedisStreamEventBus] Handler failed for "${type}"`, { error: (handlerErr as Error).message });
                }
              }
            }

            await this.redis.xAck(streamKey, groupName, message.id);
          }
        }
      } catch (err) {
        logger.error(`[RedisStreamEventBus] Error in consumer for "${type}"`, { error: (err as Error).message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
}
