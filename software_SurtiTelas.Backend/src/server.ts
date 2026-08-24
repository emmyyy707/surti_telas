import { createApp } from './config/app';
import { env } from './config/env';
import { validateProductionSecrets } from './config/validateProductionSecrets';
import { prisma } from './config/database';
import { redisClient, connectRedis } from './config/redis';
import { startTracing, shutdownTracing } from './config/tracing';

const app = createApp();

import { eventBus } from './shared/infrastructure/eventBus';
import { notificationSubscriber } from './modules/notifications/infrastructure/container/notificationContainer';
import { OrderReceiptPaymentSubscriber } from './modules/orders/application/use-cases/OrderReceiptPaymentSubscriber';
import { ReceiptSendSubscriber } from './modules/sales-orders/application/use-cases/ReceiptSendSubscriber';
import { PrismaOrderRepository } from './modules/orders/infrastructure/repositories/PrismaOrderRepository';
import { PrismaSaleRepository } from './modules/sales-orders/infrastructure/repositories/PrismaSaleRepository';
import { PrismaReceiptRepository } from './modules/sales-orders/infrastructure/repositories/PrismaReceiptRepository';
import { PrismaCompanyConfigRepository } from './modules/company/infrastructure/repositories/PrismaCompanyConfigRepository';
import { receiptSender } from './modules/sales-orders/infrastructure/container/salesOrderContainer';
import { ReceiptPaymentSubscriber } from './modules/receipts/application/use-cases/ReceiptPaymentSubscriber';
import { OrderDeliverySubscriber } from './modules/orders/application/use-cases/OrderDeliverySubscriber';
import { WebhookSubscriber } from './modules/webhooks/infrastructure/subscribers/WebhookSubscriber';

notificationSubscriber.register(eventBus);
new OrderReceiptPaymentSubscriber(eventBus);
new ReceiptPaymentSubscriber(eventBus);
new OrderDeliverySubscriber(eventBus);

const orderRepository = new PrismaOrderRepository(prisma);
const saleRepository = new PrismaSaleRepository(prisma);
const receiptRepository = new PrismaReceiptRepository(prisma);
const companyRepository = new PrismaCompanyConfigRepository(prisma);
new ReceiptSendSubscriber(eventBus, orderRepository, saleRepository, receiptRepository, companyRepository, receiptSender);

new WebhookSubscriber().register(eventBus);

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
