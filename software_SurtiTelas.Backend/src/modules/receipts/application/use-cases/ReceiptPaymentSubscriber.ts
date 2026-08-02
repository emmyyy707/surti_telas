import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

export class ReceiptPaymentSubscriber {
  constructor(private readonly eventBus: EventBus) {
    this.subscribe();
  }

  private subscribe() {
    this.eventBus.subscribe('receipt.paid', async (event: DomainEvent) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
        total: number;
        estado: string;
      };

      logger.info(`[ReceiptPaymentSubscriber] Recibo marcado como pagado: ${payload.receiptId}`, { payload });

      try {
        const existingPayment = await prisma.payment.findFirst({
          where: { orderId: payload.orderId ?? undefined, deletedAt: null },
        });

        if (existingPayment) {
          if (existingPayment.status === 'APPROVED') {
            logger.info(`[ReceiptPaymentSubscriber] Pago ya aprobado para recibo ${payload.receiptId}, no se actualiza.`);
            return;
          }

          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: 'APPROVED',
              amount: Number(payload.total),
              paidAt: new Date(),
            },
          });

          logger.info(`[ReceiptPaymentSubscriber] Pago actualizado a APPROVED para recibo ${payload.receiptId}: ${existingPayment.id}`);
          return;
        }

        await prisma.payment.create({
          data: {
            orderId: payload.orderId ?? 'REC-' + payload.receiptId,
            customerId: payload.customerId,
            amount: Number(payload.total),
            method: 'OTHER',
            status: 'APPROVED',
            paidAt: new Date(),
            notes: 'Pago generado automáticamente por recibo pagado',
          },
        });

        logger.info(`[ReceiptPaymentSubscriber] Pago generado para recibo ${payload.receiptId}`);
      } catch (error) {
        logger.error(`[ReceiptPaymentSubscriber] Error generando pago para recibo ${payload.receiptId}`, { error: (error as Error).message });
      }
    });
  }
}
