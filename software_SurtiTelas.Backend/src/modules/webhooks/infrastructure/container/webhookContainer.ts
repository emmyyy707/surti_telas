import { PrismaWebhookSubscriptionRepository } from '../repositories/PrismaWebhookSubscriptionRepository';
import { prisma } from '../../../../config/database';
import { ListWebhooks, GetWebhookById, CreateWebhook, UpdateWebhook, DeleteWebhook } from '../../application/use-cases/WebhookUseCases';

const webhookRepository = new PrismaWebhookSubscriptionRepository(prisma);

export const webhookUseCases = {
  listWebhooks: new ListWebhooks(webhookRepository),
  getWebhookById: new GetWebhookById(webhookRepository),
  createWebhook: new CreateWebhook(webhookRepository),
  updateWebhook: new UpdateWebhook(webhookRepository),
  deleteWebhook: new DeleteWebhook(webhookRepository),
};
