import { prisma } from '../../../../config/database';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';

export class RemoveSaleItem {
  constructor(private readonly saleRepo: SaleRepository) {}

  async execute(saleId: string, itemId: string): Promise<void> {
    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      throw new NotFoundError('Venta no encontrada');
    }

    if (sale.estado !== 'COMPLETADA') {
      throw new BadRequestError('Solo se pueden eliminar productos de ventas completadas');
    }

    const order = await prisma.order.findFirst({
      where: { id: sale.orderId, deletedAt: null },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Pedido asociado no encontrado');
    }

    if (order.estado === 'CANCELADO' || order.estado === 'ENTREGADO' || order.estado === 'RECIBO_ENVIADO') {
      throw new BadRequestError('No se pueden eliminar productos de un pedido en estado de entrega o cancelación');
    }

    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId: order.id },
      select: { id: true, nombre: true, precio: true, cantidad: true },
    });

    if (!item) {
      throw new NotFoundError('Producto no encontrado en la venta');
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { id: itemId } });

      const remainingItems = order.items.filter((i) => i.id !== itemId);
      const subtotal = remainingItems.reduce((sum, i) => sum + Number(i.precio.toNumber?.() ?? i.precio) * i.cantidad, 0);
      const impuestos = Math.round(subtotal * 0.19);
      const total = subtotal + impuestos - (sale.descuentos || 0);

      await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal,
          impuestos,
          total,
          itemsCount: { decrement: item.cantidad },
        },
      });

      await tx.sale.update({
        where: { id: saleId },
        data: {
          subtotal,
          impuestos,
          total,
        },
      });

      await tx.orderHistory.create({
        data: {
          pedidoId: order.id,
          accion: 'ITEM_ELIMINADO',
          estadoAnterior: order.estado,
          estadoNuevo: order.estado,
          informacion: { producto: item.nombre, cantidad: item.cantidad },
        },
      });
    });
  }
}
