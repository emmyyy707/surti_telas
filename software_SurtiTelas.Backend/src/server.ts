import { createApp } from './config/app';
import { env } from './config/env';
import { validateProductionSecrets } from './config/validateProductionSecrets';
import { prisma } from './config/database';
import { redisClient, connectRedis } from './config/redis';
import { startTracing, shutdownTracing } from './config/tracing';

const app = createApp();

import { eventBus } from './shared/infrastructure/eventBus';
import { logger } from './shared/infrastructure/logger';
import { notificationSubscriber } from './modules/notifications/infrastructure/container/notificationContainer';
import { OrderReceiptPaymentSubscriber } from './modules/orders/application/use-cases/OrderReceiptPaymentSubscriber';
import { PrismaWebhookSubscriptionRepository } from './modules/webhooks/infrastructure/repositories/PrismaWebhookSubscriptionRepository';
import { WebhookDispatcher } from './modules/webhooks/application/WebhookDispatcher';
import { SalesOrderNotificationSubscriber } from './modules/sales-orders/application/use-cases/SalesOrderNotificationSubscriber';
import { ReceiptSendSubscriber } from './modules/sales-orders/application/use-cases/ReceiptSendSubscriber';
import { PrismaOrderRepository } from './modules/orders/infrastructure/repositories/PrismaOrderRepository';
import { PrismaSaleRepository } from './modules/sales-orders/infrastructure/repositories/PrismaSaleRepository';
import { PrismaReceiptRepository } from './modules/sales-orders/infrastructure/repositories/PrismaReceiptRepository';
import { PrismaCompanyConfigRepository } from './modules/company/infrastructure/repositories/PrismaCompanyConfigRepository';
import { receiptSender } from './modules/sales-orders/infrastructure/container/salesOrderContainer';
import { ReceiptPaymentSubscriber } from './modules/receipts/application/use-cases/ReceiptPaymentSubscriber';

notificationSubscriber.register(eventBus);
new OrderReceiptPaymentSubscriber(eventBus);
new SalesOrderNotificationSubscriber(eventBus);
new ReceiptPaymentSubscriber(eventBus);

const orderRepository = new PrismaOrderRepository(prisma);
const saleRepository = new PrismaSaleRepository(prisma);
const receiptRepository = new PrismaReceiptRepository(prisma);
const companyRepository = new PrismaCompanyConfigRepository(prisma);
new ReceiptSendSubscriber(eventBus, orderRepository, saleRepository, receiptRepository, companyRepository, receiptSender);

const webhookRepo = new PrismaWebhookSubscriptionRepository(prisma);
const webhookDispatcher = new WebhookDispatcher(webhookRepo);
const WEBHOOK_EVENT_TYPES = [
  'order.created',
  'order.status.updated',
  'order.delivered',
  'order.canceled',
  'stock.below_minimum',
  'production.completed',
];
for (const eventType of WEBHOOK_EVENT_TYPES) {
  eventBus.subscribe(eventType, (event) => {
    webhookDispatcher.dispatch(event).catch((err) => {
      logger.error(`[Webhook] Unhandled dispatch error for ${eventType}`, { error: (err as Error).message });
    });
  });
}

async function bootstrap() {
  try {
    console.log('Iniciando servidor...');
    validateProductionSecrets(env);
    console.log('Validación de secretos OK');
    await connectRedis();
    console.log('Redis conectado');
    startTracing();
    console.log('Tracing iniciado');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 SurtiTelas API en http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });

    async function shutdown(signal: string) {
      console.log(`${signal} recibido, cerrando servidor...`);

      server.close(async () => {
        try {
          await prisma.$disconnect();
          await redisClient.quit();
          await shutdownTracing();
          console.log('Conexiones cerradas correctamente');
          process.exit(0);
        } catch (err) {
          console.error('Error durante el shutdown', (err as Error).message);
          process.exit(1);
        }
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Error al iniciar el servidor', (err as Error).message);
    process.exit(1);
  }
}

bootstrap();

export { app };
