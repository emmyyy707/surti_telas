import { Request, Response } from 'express';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { webhookUseCases } from '../../infrastructure/container/webhookContainer';
import type { DomainEvent } from '../../../../shared/application/EventBus';
import type { WebhookSubscription, WebhookSubscriptionData } from '../../domain/entities/WebhookSubscription';
import { PrismaWebhookSubscriptionRepository } from '../../infrastructure/repositories/PrismaWebhookSubscriptionRepository';
import { WebhookDispatcher } from '../../application/WebhookDispatcher';
import { prisma } from '../../../../config/database';
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
  const response = buildApiPaginatedResponse(
    sanitized,
    result.meta.total,
    page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
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

export const testWebhook = async (req: Request, res: Response) => {
  const webhook = await webhookUseCases.getWebhookById.execute(req.params.id);
  const sanitized = sanitize(webhook);
  const event: DomainEvent = {
    type: 'order.created',
    occurredAt: new Date(),
    payload: {
      orderId: 'TEST-' + Date.now(),
      orderNumero: 'TEST-' + Date.now(),
      clienteNombre: 'Cliente de prueba',
      total: 100000,
      itemsCount: 1,
      paymentMethod: 'OTHER',
    },
  };
  const repo = new PrismaWebhookSubscriptionRepository(prisma);
  const dispatcher = new WebhookDispatcher(repo);
  await dispatcher.dispatch(event);
  return ok(res, { ...sanitized, testEvent: event }, 'Webhook de prueba enviado');
};
