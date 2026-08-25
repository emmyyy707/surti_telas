import { prisma } from '../../../../config/database';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';

export interface AddSaleItemInput {
  nombre: string;
  precio: number;
  cantidad: number;
  productId?: string;
}

export class AddSaleItem {
  constructor(private readonly saleRepo: SaleRepository) {}

  async execute(saleId: string, input: AddSaleItemInput): Promise<void> {
    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      throw new NotFoundError('Venta no encontrada');
    }

    if (sale.estado !== 'COMPLETADA') {
      throw new BadRequestError('Solo se pueden agregar productos a ventas completadas');
    }

    if (input.cantidad < 1) {
      throw new BadRequestError('La cantidad debe ser mayor a 0');
    }
    if (input.precio < 0) {
      throw new BadRequestError('El precio no puede ser negativo');
    }
    if (!input.nombre || input.nombre.trim().length === 0) {
      throw new BadRequestError('El nombre del producto es obligatorio');
    }

    const order = await prisma.order.findFirst({
      where: { id: sale.orderId, deletedAt: null },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Pedido asociado no encontrado');
    }

    if (order.estado === 'CANCELADO' || order.estado === 'ENTREGADO' || order.estado === 'RECIBO_ENVIADO') {
      throw new BadRequestError('No se pueden agregar productos a un pedido en estado de entrega o cancelación');
    }

    if (input.productId) {
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true, nombre: true, precio: true, cantidadStock: true },
      });
      if (!product) {
        throw new NotFoundError('Producto no encontrado');
      }
      if (product.cantidadStock <= 0) {
        throw new BadRequestError('El producto no tiene stock disponible');
      }
      input.nombre = product.nombre;
      input.precio = Number(product.precio.toNumber?.() ?? product.precio);
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: input.productId ?? null,
          nombre: input.nombre,
          precio: input.precio,
          cantidad: input.cantidad,
        },
      });

     const updatedItems = [...(order.items ?? []), {
        nombre: input.nombre,
        precio: { toNumber: () => input.precio },
        cantidad: input.cantidad,
      }];

      const subtotal = updatedItems.reduce((sum, item) => sum + item.precio.toNumber() * item.cantidad, 0);
      const impuestos = Math.round(subtotal * 0.19);
      const total = subtotal + impuestos - (sale.descuentos || 0);

      await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal,
          impuestos,
          total,
          itemsCount: { increment: input.cantidad },
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
          accion: 'ITEM_AGREGADO',
          estadoAnterior: order.estado,
          estadoNuevo: order.estado,
          informacion: { producto: input.nombre, cantidad: input.cantidad, precio: input.precio },
        },
      });
    });
  }
}
