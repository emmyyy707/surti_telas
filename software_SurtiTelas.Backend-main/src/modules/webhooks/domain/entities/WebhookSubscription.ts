export type WebhookEventType = string;

export interface WebhookSubscriptionData {
  id?: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  active: boolean;
  usuarioId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class WebhookSubscription {
  readonly id?: string;
  readonly url: string;
  readonly secret?: string;
  readonly events: WebhookEventType[];
  readonly active: boolean;
  readonly usuarioId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;

  constructor(data: WebhookSubscriptionData) {
    WebhookSubscription.validate(data);
    this.id = data.id;
    this.url = data.url;
    this.secret = data.secret;
    this.events = data.events;
    this.active = data.active;
    this.usuarioId = data.usuarioId;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.deletedAt = data.deletedAt;
  }

  static validate(data: WebhookSubscriptionData): void {
    if (!data.url || !data.url.startsWith('http')) {
      throw new Error('La URL del webhook debe ser válida');
    }
    if (!data.events || data.events.length === 0) {
      throw new Error('El webhook debe estar suscrito a al menos un evento');
    }
  }

  matchesEvent(eventType: string): boolean {
    return this.active && this.events.includes(eventType);
  }
}
