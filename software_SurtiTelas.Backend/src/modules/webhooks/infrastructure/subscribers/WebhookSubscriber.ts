import type { DomainEvent } from '../../../../shared/application/EventBus';
import { WebhookDispatcher } from '../../application/WebhookDispatcher';
import { PrismaWebhookSubscriptionRepository } from '../../infrastructure/repositories/PrismaWebhookSubscriptionRepository';
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

const EVENTS = [
  'order.created',
  'order.status.updated',
  'order.delivered',
  'order.canceled',
  'stock.below_minimum',
  'production.completed',
] as const;

export class WebhookSubscriber {
  private readonly dispatcher: WebhookDispatcher;

  constructor() {
    const repo = new PrismaWebhookSubscriptionRepository(prisma);
    this.dispatcher = new WebhookDispatcher(repo);
  }

  register(eventBus: { subscribe: (type: string, handler: (event: DomainEvent) => Promise<void> | void) => void }): void {
    for (const eventType of EVENTS) {
      eventBus.subscribe(eventType, (event) => {
        this.dispatcher.dispatch(event).catch((error) => {
          logger.error(`[WebhookSubscriber] Error dispatching ${eventType}`, { error: (error as Error).message });
        });
      });
    }
    logger.info('[WebhookSubscriber] Registered', { events: EVENTS });
  }
}
