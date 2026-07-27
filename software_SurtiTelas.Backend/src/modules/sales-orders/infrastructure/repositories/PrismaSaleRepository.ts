import { PrismaClient } from '@prisma/client';
import type { Sale, SaleRepository } from '../../domain/repositories/SaleRepository';
import { toSale } from '../mappers/SaleMapper';

export class PrismaSaleRepository implements SaleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> {
    const row = await this.prisma.sale.create({
      data: {
        orderId: sale.orderId,
        clienteId: sale.clienteId,
        clienteNombre: sale.clienteNombre,
        asesorId: sale.asesorId,
        asesorNombre: sale.asesorNombre,
        subtotal: sale.subtotal,
        impuestos: sale.impuestos,
        descuentos: sale.descuentos,
        total: sale.total,
        estado: sale.estado,
        medioPago: sale.medioPago,
      },
    });
    return toSale(row);
  }

  async findByOrderId(orderId: string): Promise<Sale | null> {
    const row = await this.prisma.sale.findFirst({
      where: { orderId, deletedAt: null },
    });
    return row ? toSale(row) : null;
  }

  async list(filters?: { clienteId?: string; asesorId?: string; desde?: string; hasta?: string }): Promise<Sale[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters?.clienteId) where.clienteId = filters.clienteId;
    if (filters?.asesorId) where.asesorId = filters.asesorId;
    if (filters?.desde || filters?.hasta) {
      where.fechaVenta = {};
      if (filters.desde) (where.fechaVenta as Record<string, Date>).gte = new Date(filters.desde);
      if (filters.hasta) (where.fechaVenta as Record<string, Date>).lte = new Date(filters.hasta);
    }

    const rows = await this.prisma.sale.findMany({ where, orderBy: { fechaVenta: 'desc' } });
    return rows.map(toSale);
  }
}
