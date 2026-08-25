import { prisma } from '../../../../config/database';
import { NotFoundError } from '../../../../shared/domain/errors';
import type { SaleRepository, SaleWithOrder } from '../../domain/repositories/SaleRepository';

export class GetSaleById {
  constructor(
    private readonly prismaClient: typeof prisma,
    private readonly saleRepo: SaleRepository,
  ) {}

  async execute(id: string): Promise<SaleWithOrder> {
    const sale = await this.saleRepo.findByIdWithOrder(id);
    if (!sale) {
      throw new NotFoundError('Venta no encontrada');
    }

    if (sale.order) {
      const customOrder = await this.prismaClient.custom_orders.findFirst({
        where: { orden_id: sale.orderId, deleted_at: null },
        select: { id: true, numero: true, estado: true },
      });

      sale.order.customOrder = customOrder
        ? {
            id: customOrder.id,
            numero: customOrder.numero,
            estado: customOrder.estado,
          }
        : null;
    }

    return sale;
  }
}
