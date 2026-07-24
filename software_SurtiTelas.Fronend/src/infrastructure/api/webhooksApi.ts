import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

export interface WebhookDTO {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  usuarioId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  usuarioId?: string;
  createdAt: string;
  updatedAt: string;
  secret?: string;
}

export interface WebhookFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
}

export function toWebhook(dto: WebhookDTO): Webhook {
  return {
    id: dto.id,
    url: dto.url,
    events: dto.events,
    active: dto.active,
    usuarioId: dto.usuarioId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    secret: (dto as { secret?: string }).secret,
  };
}

export interface WebhooksListResult {
  data: Webhook[];
  meta: PaginatedResponse<WebhookDTO>['data']['meta'];
}

export const webhooksApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<WebhooksListResult> {
    const response = await api.get<{ items: WebhookDTO[]; meta: PaginatedResponse<WebhookDTO>['data']['meta'] }>('/webhooks', { query });
    const data = (response?.items ?? []).map(toWebhook);
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { data, meta };
  },

  async getById(id: string): Promise<Webhook | null> {
    try {
      const dto = await api.get<WebhookDTO>(`/webhooks/${encodeURIComponent(id)}`);
      return dto ? toWebhook(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: { url: string; events: string[]; secret?: string }): Promise<Webhook> {
    const dto = await api.post<WebhookDTO>('/webhooks', data);
    return toWebhook(dto);
  },

  async update(id: string, changes: { url?: string; events?: string[]; active?: boolean; secret?: string }): Promise<Webhook> {
    const dto = await api.patch<WebhookDTO>(`/webhooks/${encodeURIComponent(id)}`, changes);
    return toWebhook(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/webhooks/${encodeURIComponent(id)}`);
  },
};
