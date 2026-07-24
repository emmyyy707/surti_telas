export interface DomainEvent {
  type: string;
  payload: unknown;
  occurredAt: Date;
  requestId?: string;
}

export interface EventBus {
  publish(event: DomainEvent): void;
  publish(event: DomainEvent, requestId?: string): void;
  subscribe(type: string, handler: (event: DomainEvent) => Promise<void> | void): void;
}
