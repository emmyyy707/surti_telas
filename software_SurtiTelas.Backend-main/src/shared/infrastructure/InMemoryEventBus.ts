import { EventEmitter } from 'events';
import type { DomainEvent, EventBus } from '../application/EventBus';
import { logger } from './logger';

export class InMemoryEventBus implements EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  publish(event: DomainEvent, requestId?: string): void {
    const enrichedEvent = { ...event, requestId };
    this.emitter.emit(enrichedEvent.type, enrichedEvent);
  }

  subscribe(type: string, handler: (event: DomainEvent) => Promise<void> | void): void {
    this.emitter.on(type, (event: DomainEvent) => {
      void Promise.resolve(handler(event)).catch((err) => {
        logger.error(`[EventBus] Handler falló para "${type}"`, { error: (err as Error).message });
      });
    });
  }
}

export const eventBus = new InMemoryEventBus();
