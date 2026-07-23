import { describe, it, expect } from 'vitest';
import { WebhookSubscription } from '@/modules/webhooks/domain/entities/WebhookSubscription';

describe('WebhookSubscription', () => {
  it('should create a valid webhook subscription', () => {
    const webhook = new WebhookSubscription({
      id: '1',
      url: 'https://example.com/webhook',
      events: ['order.created', 'order.delivered'],
      active: true,
    });

    expect(webhook.url).toBe('https://example.com/webhook');
    expect(webhook.events).toHaveLength(2);
    expect(webhook.active).toBe(true);
  });

  it('should throw for invalid URL', () => {
    expect(() => {
      new WebhookSubscription({
        url: 'not-a-url',
        events: ['order.created'],
        active: true,
      });
    }).toThrow('La URL del webhook debe ser válida');
  });

  it('should throw for empty events', () => {
    expect(() => {
      new WebhookSubscription({
        url: 'https://example.com/webhook',
        events: [],
        active: true,
      });
    }).toThrow('El webhook debe estar suscrito a al menos un evento');
  });

  it('should match subscribed events', () => {
    const webhook = new WebhookSubscription({
      url: 'https://example.com/webhook',
      events: ['order.created', 'stock.below_minimum'],
      active: true,
    });

    expect(webhook.matchesEvent('order.created')).toBe(true);
    expect(webhook.matchesEvent('stock.below_minimum')).toBe(true);
    expect(webhook.matchesEvent('order.delivered')).toBe(false);
  });

  it('should not match events when inactive', () => {
    const webhook = new WebhookSubscription({
      url: 'https://example.com/webhook',
      events: ['order.created'],
      active: false,
    });

    expect(webhook.matchesEvent('order.created')).toBe(false);
  });
});
