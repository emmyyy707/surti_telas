import type { DomainEvent } from './EventBus';

export type { DomainEvent, EventBus } from './EventBus';

export class OrderCreatedEvent implements DomainEvent {
  readonly type = 'order.created';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      orderId: string;
      orderNumero: string;
      clienteId: string;
      clienteNombre: string;
      asesorId: string;
      asesorNombre: string;
      total: number;
      itemsCount: number;
      paymentMethod: string;
      installments?: number;
    },
    public readonly requestId?: string
  ) {}
}

export class OrderStatusUpdatedEvent implements DomainEvent {
  readonly type = 'order.status.updated';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      orderId: string;
      orderNumero: string;
      previousStatus: string;
      newStatus: string;
      clienteId: string;
      clienteNombre: string;
      asesorId: string;
      asesorNombre: string;
    },
    public readonly requestId?: string
  ) {}
}

export class StockReservedEvent implements DomainEvent {
  readonly type = 'stock.reserved';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      orderId: string;
      items: { productId: string; productRef: string; cantidad: number }[];
    },
    public readonly requestId?: string
  ) {}
}

export class OrderDeliveredEvent implements DomainEvent {
  readonly type = 'order.delivered';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      orderId: string;
      clienteId: string;
      clienteNombre: string;
      total: number;
    },
    public readonly requestId?: string
  ) {}
}

export class OrderCanceledEvent implements DomainEvent {
  readonly type = 'order.canceled';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      orderId: string;
      clienteId: string;
      clienteNombre: string;
      total: number;
      items: { productId: string; productRef: string; cantidad: number }[];
    },
    public readonly requestId?: string
  ) {}
}

export class StockBelowMinimumEvent implements DomainEvent {
  readonly type = 'stock.below_minimum';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      rawMaterialId: string;
      rawMaterialNombre: string;
      stockActual: number;
      stockMinimo: number;
    },
    public readonly requestId?: string
  ) {}
}

export class ProductionCompletedEvent implements DomainEvent {
  readonly type = 'production.completed';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      productionOrderId: string;
      referencia: string;
      cantidad: number;
      tallerId?: string;
    },
    public readonly requestId?: string
  ) {}
}

export class AuthLoginEvent implements DomainEvent {
  readonly type = 'auth.login';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      userId: string;
      email: string;
      ip?: string;
      userAgent?: string;
    },
    public readonly requestId?: string
  ) {}
}

export class AuthLoginFailedEvent implements DomainEvent {
  readonly type = 'auth.login.failed';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      email?: string;
      reason?: string;
      ip?: string;
      userAgent?: string;
    },
    public readonly requestId?: string
  ) {}
}

export class AuthLogoutEvent implements DomainEvent {
  readonly type = 'auth.logout';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      userId: string;
      email?: string;
    },
    public readonly requestId?: string
  ) {}
}

export class UserCreatedEvent implements DomainEvent {
  readonly type = 'user.created';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      userId: string;
      nombre: string;
      email: string;
      role: string;
    },
    public readonly requestId?: string
  ) {}
}

export class UserUpdatedEvent implements DomainEvent {
  readonly type = 'user.updated';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      userId: string;
      nombre?: string;
      cambios: Record<string, unknown>;
    },
    public readonly requestId?: string
  ) {}
}

export class UserDeletedEvent implements DomainEvent {
  readonly type = 'user.deleted';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      userId: string;
      nombre?: string;
    },
    public readonly requestId?: string
  ) {}
}

export class ProductCreatedEvent implements DomainEvent {
  readonly type = 'product.created';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      productId: string;
      nombre: string;
    },
    public readonly requestId?: string
  ) {}
}

export class ProductUpdatedEvent implements DomainEvent {
  readonly type = 'product.updated';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      productId: string;
      nombre: string;
      cambios: unknown;
    },
    public readonly requestId?: string
  ) {}
}

export class ProductDeletedEvent implements DomainEvent {
  readonly type = 'product.deleted';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      productId: string;
      nombre: string;
    },
    public readonly requestId?: string
  ) {}
}

export class ControlCreatedEvent implements DomainEvent {
  readonly type = 'control.created';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      controlId: string;
      produccionId: string;
      etapa: string;
      estado: string;
      cantidadTotal: number;
      creadoPorId: string;
    },
    public readonly requestId?: string
  ) {}
}

export class ControlUpdatedEvent implements DomainEvent {
  readonly type = 'control.updated';
  readonly occurredAt = new Date();

  constructor(
    public readonly payload: {
      controlId: string;
      produccionId: string;
      estado: string;
      etapa: string;
      creadoPorId: string;
      revisadoPorId: string;
    },
    public readonly requestId?: string
  ) {}
}
