import { randomBytes } from 'crypto';
import type { WebhookFilters, WebhookSubscriptionRepository } from '../../domain/repositories/WebhookSubscriptionRepository';
import { NotFoundError } from '../../../../shared/domain/errors';

export class ListWebhooks {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}
  execute(filters?: WebhookFilters) {
    return this.repo.list(filters);
  }
}

export class GetWebhookById {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}
  async execute(id: string) {
    const webhook = await this.repo.getById(id);
    if (!webhook) throw new NotFoundError('Webhook no encontrado');
    return webhook;
  }
}

export class CreateWebhook {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}
  execute(input: { url: string; secret?: string; events: string[]; usuarioId?: string }) {
    const secret = input.secret || randomBytes(32).toString('hex');
    return this.repo.create({ ...input, secret });
  }
}

export class UpdateWebhook {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}
  async execute(id: string, changes: { url?: string; secret?: string; events?: string[]; active?: boolean }) {
    const webhook = await this.repo.update(id, changes);
    return webhook;
  }
}

export class DeleteWebhook {
  constructor(private readonly repo: WebhookSubscriptionRepository) {}
  async execute(id: string) {
    await this.repo.delete(id);
  }
}
