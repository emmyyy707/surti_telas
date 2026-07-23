import { Request, Response } from 'express';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { webhookUseCases } from '../../infrastructure/container/webhookContainer';
import type { WebhookSubscription, WebhookSubscriptionData } from '../../domain/entities/WebhookSubscription';
import { CreateWebhookSchema, UpdateWebhookSchema, WebhookFiltersSchema } from '../validators/webhook.validators';

type PublicWebhook = Omit<WebhookSubscriptionData, 'secret'>;

const sanitize = (webhook: WebhookSubscription): PublicWebhook => {
  const { secret: _secret, ...rest } = webhook;
  void _secret;
  return rest;
};

export const listWebhooks = async (req: Request, res: Response) => {
  const filters = parseDto(WebhookFiltersSchema, req.query);
  if (req.user?.role !== 'ADMIN') {
    filters.usuarioId = req.user?.id;
  }
  const result = await webhookUseCases.listWebhooks.execute(filters);
  const sanitized = result.data.map(sanitize);
  const page = result.meta.page ?? 1;
  const meta = buildPaginationMeta(
    result.meta.total,
    page,
    result.meta.limit,
    req.originalUrl,
    { usuarioId: filters.usuarioId, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { data: sanitized, meta });
};

export const getWebhook = async (req: Request, res: Response) => {
  const webhook = await webhookUseCases.getWebhookById.execute(req.params.id);
  const sanitized = sanitize(webhook);
  const hateoas = buildHateoasLinks('/api/v1/webhooks', sanitized.id);
  return ok(res, { ...sanitized, _links: hateoas });
};

export const createWebhook = async (req: Request, res: Response) => {
  const input = parseDto(CreateWebhookSchema, req.body);
  const webhook = await webhookUseCases.createWebhook.execute({ ...input, usuarioId: req.user!.id });
  const sanitized = sanitize(webhook);
  const responseBody: Record<string, unknown> = { ...sanitized, _links: buildHateoasLinks('/api/v1/webhooks', sanitized.id) };
  if (webhook.secret) {
    responseBody.secret = webhook.secret;
  }
  return created(res, responseBody, 'Webhook creado');
};

export const updateWebhook = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateWebhookSchema, req.body);
  const webhook = await webhookUseCases.updateWebhook.execute(req.params.id, changes);
  const sanitized = sanitize(webhook);
  return ok(res, sanitized, 'Webhook actualizado');
};

export const deleteWebhook = async (req: Request, res: Response) => {
  await webhookUseCases.deleteWebhook.execute(req.params.id);
  return noContent(res);
};
