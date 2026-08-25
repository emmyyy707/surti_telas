import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { SaleCreationService } from '../services/SaleCreationService';

export interface CreateSaleInput {
  orderId: string;
  medioPago: string;
  observaciones?: string;
}

export class CreateSale {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly saleRepo: SaleRepository,
    receiptRepo: ReceiptRepository,
    _historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
    private readonly saleCreationService?: SaleCreationService,
  ) {
    if (!this.saleCreationService) {
      this.saleCreationService = new SaleCreationService(saleRepo, receiptRepo);
    }
  }

  async execute(input: CreateSaleInput): Promise<{ orderId: string; saleId: string; receiptId: string }> {
    if (!input.orderId) throw new BadRequestError('orderId es obligatorio');
    const medioPago = input.medioPago ?? 'CASH';

    const order = await this.orderRepo.getById(input.orderId);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.isSalesFlow()) {
      throw new BadRequestError('Solo se pueden registrar ventas para pedidos de flujo de ventas');
    }

    const existingSale = await this.saleRepo.findByOrderId(order.id);
    if (existingSale) {
      throw new BadRequestError(`El pedido ${order.numero} ya tiene una venta registrada (id: ${existingSale.id})`);
    }

    if (order.estado !== 'Pendiente' && order.estado !== 'En validación') {
      throw new BadRequestError(
        `El pedido debe estar en estado Pendiente o En validación para registrar una venta. Estado actual: ${order.estado}`,
      );
    }

    const result = await this.saleCreationService!.createSaleAndReceipt(order, order.asesorId, medioPago);

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.accepted',
        occurredAt: new Date(),
        payload: {
          orderId: order.id,
          orderNumero: order.numero,
          clienteId: order.clienteId,
          clienteNombre: order.cliente,
          asesorId: order.asesorId,
          asesorNombre: order.asesor,
          saleId: result.saleId,
          receiptId: result.receiptId,
          total: order.total,
        },
      });
    }

    return { orderId: order.id, saleId: result.saleId, receiptId: result.receiptId };
  }
}
