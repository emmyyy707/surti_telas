import type { DomainEvent } from '../../../shared/application/EventBus';
import { WebhookSubscription } from '../domain/entities/WebhookSubscription';
import { WebhookSubscriptionRepository } from '../domain/repositories/WebhookSubscriptionRepository';
import { logger } from '../../../shared/infrastructure/logger';
import { createHmac, randomUUID } from 'node:crypto';

export class WebhookDispatcher {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}

  async dispatch(event: DomainEvent): Promise<void> {
    const { data: subscriptions } = await this.repo.list({ active: true, limit: 1000 });
    const matched = subscriptions.filter((sub) => sub.matchesEvent(event.type));

    for (const sub of matched) {
      this.deliver(sub, event).catch((err) => {
        logger.error(`[Webhook] Failed to deliver ${event.type} to ${sub.url}`, { error: (err as Error).message });
      });
    }
  }

  private async deliver(subscription: WebhookSubscription, event: DomainEvent): Promise<void> {
    const payload = JSON.stringify({
      id: randomUUID(),
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.payload,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SurtiTelas-Webhook/1.0',
    };

    if (subscription.secret) {
      const signature = createHmac('sha256', subscription.secret).update(payload).digest('hex');
      headers['X-SurtiTelas-Signature'] = `sha256=${signature}`;
    }

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(subscription.url, {
          method: 'POST',
          headers,
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          logger.info(`[Webhook] Delivered ${event.type} to ${subscription.url}`);
          return;
        }

        logger.warn(`[Webhook] Delivery failed for ${subscription.url}: ${response.status} ${response.statusText}`);
      } catch (error) {
        logger.error(`[Webhook] Delivery error for ${subscription.url} (attempt ${attempt})`, { error: (error as Error).message });
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
}
