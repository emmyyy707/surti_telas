import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { CompanyConfigRepository } from '../../../company/domain/repositories/CompanyConfigRepository';
import { ReceiptSender } from '../../infrastructure/services/ReceiptSender';
import { logger } from '../../../../shared/infrastructure/logger';

export class ReceiptSendSubscriber {
  constructor(
    private readonly eventBus: EventBus,
    private readonly orderRepo: OrderRepository,
    private readonly saleRepo: SaleRepository,
    private readonly receiptRepo: ReceiptRepository,
    private readonly companyRepo: CompanyConfigRepository,
    private readonly receiptSender: ReceiptSender,
  ) {
    this.subscribe();
  }

  private subscribe() {
    this.eventBus.subscribe('order.accepted', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        saleId: string;
        receiptId: string;
        total: number;
      };

      await this.sendReceipt(payload.orderId, payload.orderNumero, payload.receiptId, event.requestId);
    });

    this.eventBus.subscribe('order.receipt.retry', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        receiptId: string;
      };

      await this.sendReceipt(payload.orderId, payload.orderNumero, payload.receiptId, event.requestId);
    });
  }

  private async sendReceipt(orderId: string, orderNumero: string, receiptId: string, requestId?: string) {
    try {
      const [order, sale, receipt, company] = await Promise.all([
        this.orderRepo.getById(orderId),
        this.saleRepo.findByOrderId(orderId),
        this.receiptRepo.getById(receiptId),
        this.companyRepo.getCompany(),
      ]);

      if (!order || !sale || !receipt || !company) {
        logger.warn('[ReceiptSendSubscriber] Datos incompletos para envío de recibo', {
          requestId,
          orderId,
          receiptId,
          hasOrder: !!order,
          hasSale: !!sale,
          hasReceipt: !!receipt,
          hasCompany: !!company,
        });
        return;
      }

      const result = await this.receiptSender.send(order, sale, receipt, company);

      if (result.success) {
        logger.info('[ReceiptSendSubscriber] Recibo enviado exitosamente', {
          requestId,
          orderId,
          orderNumero,
          receiptId,
        });
      } else {
        logger.warn('[ReceiptSendSubscriber] Error enviando recibo', {
          requestId,
          orderId,
          orderNumero,
          receiptId,
          error: result.error,
        });
      }
    } catch (error) {
      logger.error('[ReceiptSendSubscriber] Error inesperado enviando recibo', {
        requestId,
        orderId,
        orderNumero,
        receiptId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
