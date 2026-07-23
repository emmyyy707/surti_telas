import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookDispatcher } from '@/modules/webhooks/application/WebhookDispatcher';
import type { WebhookSubscriptionRepository } from '@/modules/webhooks/domain/repositories/WebhookSubscriptionRepository';
import { WebhookSubscription } from '@/modules/webhooks/domain/entities/WebhookSubscription';
import type { DomainEvent } from '@/shared/application/EventBus';

const mockRepo = {
  list: vi.fn(),
} satisfies Partial<WebhookSubscriptionRepository> as WebhookSubscriptionRepository;

const createMockSubscription = (overrides = {}): WebhookSubscription => {
  return new WebhookSubscription({
    id: '1',
    url: 'https://example.com/webhook',
    secret: 'secret',
    events: ['order.created'],
    active: true,
    ...overrides,
  });
};

describe('WebhookDispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should dispatch event to matching webhooks', async () => {
    const webhook = createMockSubscription();
    mockRepo.list.mockResolvedValue({ data: [webhook], meta: { total: 1, limit: 1000 } });
    (global.fetch as any).mockResolvedValue({ ok: true });

    const dispatcher = new WebhookDispatcher(mockRepo);
    const event: DomainEvent = {
      type: 'order.created',
      payload: { orderId: '1' },
      occurredAt: new Date(),
    };

    await dispatcher.dispatch(event);

    expect(mockRepo.list).toHaveBeenCalledWith({ active: true, limit: 1000 });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-SurtiTelas-Signature': expect.stringMatching(/^sha256=.+$/),
        }),
      })
    );
  });

  it('should not dispatch to inactive webhooks', async () => {
    const webhook = createMockSubscription({ active: false });
    mockRepo.list.mockResolvedValue({ data: [webhook], meta: { total: 1, limit: 1000 } });

    const dispatcher = new WebhookDispatcher(mockRepo);
    const event: DomainEvent = {
      type: 'order.created',
      payload: {},
      occurredAt: new Date(),
    };

    await dispatcher.dispatch(event);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not dispatch when no webhooks match event type', async () => {
    const webhook = createMockSubscription({ events: ['order.delivered'] });
    mockRepo.list.mockResolvedValue({ data: [webhook], meta: { total: 1, limit: 1000 } });

    const dispatcher = new WebhookDispatcher(mockRepo);
    const event: DomainEvent = {
      type: 'order.created',
      payload: {},
      occurredAt: new Date(),
    };

    await dispatcher.dispatch(event);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
