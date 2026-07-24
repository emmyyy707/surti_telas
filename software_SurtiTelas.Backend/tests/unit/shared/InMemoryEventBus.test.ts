import { describe, it, expect } from 'vitest';
import { InMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';
import type { DomainEvent } from '@/shared/application/events';

describe('InMemoryEventBus', () => {
  it('should publish and subscribe to events', async () => {
    const eventBus = new InMemoryEventBus();
    const handler = vi.fn();

    eventBus.subscribe('test.event', handler);
    eventBus.publish({ type: 'test.event', occurredAt: new Date(), payload: { id: '1' } } as DomainEvent);

    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler for different event types', async () => {
    const eventBus = new InMemoryEventBus();
    const handler = vi.fn();

    eventBus.subscribe('test.event', handler);
    eventBus.publish({ type: 'other.event', occurredAt: new Date(), payload: {} } as DomainEvent);

    expect(handler).not.toHaveBeenCalled();
  });
});
