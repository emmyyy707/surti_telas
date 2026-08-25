import { NotFoundError, BadRequestError } from '../../../../shared/domain/errors';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';
import { Order } from '../../../orders/domain/entities/Order';
import { toOrderData } from '../../../orders/infrastructure/mappers/OrderMapper';
import { SaleCreationService } from '../services/SaleCreationService';

export class AcceptOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly historyRepo: OrderHistoryRepository,
    saleRepo: SaleRepository,
    receiptRepo: ReceiptRepository,
    private readonly eventBus?: EventBus,
    private readonly saleCreationService?: SaleCreationService,
  ) {
    if (!this.saleCreationService) {
      this.saleCreationService = new SaleCreationService(saleRepo, receiptRepo);
    }
  }

  async execute(id: string, data: {
    usuarioId: string;
    medioPago?: string;
  }, requestId?: string) {
    const order = await this.orderRepo.getById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (!order.canBeAccepted()) {
      throw new BadRequestError('El pedido no puede ser aceptado en su estado actual');
    }

    if (!order.hasPaymentProof()) {
      throw new BadRequestError('El pedido debe tener un comprobante de pago válido');
    }

    const fechaValidacion = new Date();
    const medioPago = data.medioPago ?? order.medioPago;

    if (!medioPago) {
      throw new BadRequestError('El pedido debe tener un medio de pago definido');
    }

    const updatedOrder = await this.orderRepo.updateToAccepted(id, {
      usuarioValidacionId: data.usuarioId,
      fechaValidacion,
      medioPago,
    });

    await this.historyRepo.create({
      pedidoId: id,
      usuarioId: data.usuarioId,
      accion: 'PEDIDO_ACEPTADO',
      estadoAnterior: order.estado,
      estadoNuevo: updatedOrder.estado,
      informacion: { medioPago },
    });

    const result = await this.saleCreationService!.createSaleAndReceipt(updatedOrder, data.usuarioId, medioPago, requestId);

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.accepted',
        occurredAt: new Date(),
        payload: {
          orderId: updatedOrder.id,
          orderNumero: updatedOrder.numero,
          clienteId: updatedOrder.clienteId,
          clienteNombre: updatedOrder.cliente,
          asesorId: updatedOrder.asesorId,
          asesorNombre: updatedOrder.asesor,
          saleId: result.saleId,
          receiptId: result.receiptId,
          total: updatedOrder.total,
        },
        requestId,
      });
    }

    return new Order(toOrderData(result.orderRow));
  }
}
