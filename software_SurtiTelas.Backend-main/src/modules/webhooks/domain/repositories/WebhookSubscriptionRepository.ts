import type { WebhookSubscription, WebhookEventType } from '../entities/WebhookSubscription';

export interface CreateWebhookInput {
  url: string;
  secret?: string;
  events: WebhookEventType[];
  usuarioId?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  secret?: string;
  events?: WebhookEventType[];
  active?: boolean;
}

export interface WebhookFilters {
  usuarioId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface WebhookSubscriptionRepository {
  list(filters?: WebhookFilters): Promise<{ data: WebhookSubscription[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<WebhookSubscription | null>;
  create(input: CreateWebhookInput): Promise<WebhookSubscription>;
  update(id: string, changes: UpdateWebhookInput): Promise<WebhookSubscription>;
  delete(id: string): Promise<void>;
}
