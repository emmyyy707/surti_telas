import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { prisma } from '../../../../config/database';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';

export class CancelSale {
  constructor(private readonly saleRepo: SaleRepository) {}

  async execute(saleId: string, motivoAnulacion: string): Promise<void> {
    if (!motivoAnulacion || motivoAnulacion.trim().length < 3) {
      throw new BadRequestError('El motivo de anulación es obligatorio (mínimo 3 caracteres)');
    }
    if (motivoAnulacion.length > 500) {
      throw new BadRequestError('El motivo de anulación no debe exceder 500 caracteres');
    }

    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      throw new NotFoundError('Venta no encontrada');
    }

    if (sale.estado === 'ANULADA') {
      throw new BadRequestError('La venta ya está anulada');
    }

    const order = await prisma.order.findFirst({
      where: { id: sale.orderId, deletedAt: null },
      select: { estado: true },
    });

    if (!order) {
      throw new NotFoundError('Pedido asociado no encontrado');
    }

    const cancelableOrderStates = ['NUEVO', 'PENDIENTE', 'EN_VALIDACION', 'ACEPTADO', 'EN_PRODUCCION', 'LISTO', 'DESPACHADO', 'EN_CAMINO', 'RECIBO_GENERADO', 'RECIBO_ENVIADO'];
    if (!cancelableOrderStates.includes(order.estado)) {
      throw new BadRequestError(`No se puede anular la venta: el pedido está en estado "${order.estado}"`);
    }

    let hasPayments = false;
    const payments = await prisma.payment.findMany({
      where: { orderId: sale.orderId, deletedAt: null },
      select: { id: true },
    });
    if (payments.length > 0) {
      hasPayments = true;
    }

    await prisma.$transaction(async (tx) => {
      await tx.sale.update({
        where: { id: saleId },
        data: {
          estado: 'ANULADA',
          motivoAnulacion,
        },
      });

      await tx.order.update({
        where: { id: sale.orderId },
        data: { estado: 'CANCELADO' },
      });

      await tx.orderHistory.create({
        data: {
          pedidoId: sale.orderId,
          accion: 'VENTA_ANULADA',
          estadoAnterior: order.estado,
          estadoNuevo: 'CANCELADO',
          razon: motivoAnulacion,
          informacion: { saleId, hasPayments },
        },
      });

      await tx.receipt.updateMany({
        where: { orderId: sale.orderId, deletedAt: null },
        data: { estado: 'ANULADO' },
      });
    });
  }
}
