import { redisClient } from '../../config/redis';
import { env } from '../../config/env';
import { InMemoryEventBus } from './InMemoryEventBus';
import { RedisStreamEventBus } from './RedisStreamEventBus';
import type { EventBus } from '../application/EventBus';

export const eventBus: EventBus = env.NODE_ENV === 'test'
  ? new InMemoryEventBus()
  : env.EVENT_BUS === 'redis'
    ? new RedisStreamEventBus(redisClient)
    : new InMemoryEventBus();
