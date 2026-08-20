import { logger } from '../../infrastructure/logger';

export type DomainEventMap = {
  'order.created': { orderId: string; orderNumero: string; clienteId: string; asesorId: string; total: number };
  'order.status.updated': { orderId: string; previousStatus: string; newStatus: string };
  'order.delivered': { orderId: string; deliveredAt: string };
  'order.canceled': { orderId: string; reason: string };
  'stock.below_minimum': { productId: string; productName: string; currentStock: number };
  'production.completed': { orderId: string; productionOrderId: string };
  'payment.completed': { orderId: string; amount: number; paymentMethod: string };
  'commission.calculated': { asesorId: string; totalSales: number; commission: number };
  'alert.triggered': { alertId: string; type: string; message: string };
  'delivery.updated': { orderId: string; status: string; location?: { lat: number; lng: number } };
  'customOrder.status.updated': {
    customOrderId: string;
    numeroSolicitud: string;
    previousStatus: string;
    newStatus: string;
    clienteId: string;
    clienteNombre: string;
    asesorId: string | null;
    asesorNombre: string | null;
  };
};

export type DomainEvent<T extends keyof DomainEventMap = keyof DomainEventMap> = {
  type: T;
  occurredAt: Date;
  payload: DomainEventMap[T];
};

type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, Set<EventHandler<DomainEvent>>> = new Map();
  private static instance: EventBus | null = null;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler<DomainEvent>);
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler<DomainEvent>);
    };
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;
    const promises = Array.from(handlers).map((handler) => {
      return Promise.resolve().then(() => {
        try {
          return handler(event);
        } catch (error) {
          logger.error(`[EventBus] Error en subscriber de ${event.type}`, { error: (error as Error).message, event });
        }
      });
    });
    await Promise.allSettled(promises);
  }

  getSubscribedEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }
}

export const eventBus = EventBus.getInstance();
