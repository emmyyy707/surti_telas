import { PrismaClient } from '@prisma/client';
import { OrderStatus as DbOrderStatus } from '@prisma/client';
import type { Sale, SaleRepository, SaleWithOrder } from '../../domain/repositories/SaleRepository';
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
        motivoAnulacion: sale.motivoAnulacion,
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

  async findById(id: string): Promise<Sale | null> {
    const row = await this.prisma.sale.findFirst({
      where: { id, deletedAt: null },
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

  async cancel(id: string, motivoAnulacion: string): Promise<Sale> {
    const row = await this.prisma.sale.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        motivoAnulacion,
      },
    });
    return toSale(row);
  }

  async updateTotals(id: string, totals: { subtotal: number; impuestos: number; descuentos: number; total: number }): Promise<Sale> {
    const row = await this.prisma.sale.update({
      where: { id },
      data: {
        subtotal: totals.subtotal,
        impuestos: totals.impuestos,
        descuentos: totals.descuentos,
        total: totals.total,
      },
    });
    return toSale(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sale.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findByIdWithOrder(id: string): Promise<SaleWithOrder | null> {
    const row = await this.prisma.sale.findFirst({
      where: { id, deletedAt: null },
      include: {
        order: {
          include: {
            cliente: true,
            asesor: true,
            items: true,
            payments: { where: { deletedAt: null } },
            receipts: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!row) return null;

    const orderRow = row.order;
    const items = (orderRow?.items ?? []).map((i) => ({
      id: i.id,
      nombre: i.nombre,
      precio: Number(i.precio),
      cantidad: i.cantidad,
      productId: i.productId ?? null,
    }));

    const payments = orderRow?.payments ?? [];
    const receipts = orderRow?.receipts ?? [];

    let customOrder: { id: string; numero: string; estado: string } | null = null;
    if (orderRow) {
      const co = await this.prisma.custom_orders.findFirst({
        where: { orden_id: orderRow.id, deleted_at: null },
        select: { id: true, numero: true, estado: true },
      });
      if (co) {
        customOrder = { id: co.id, numero: co.numero, estado: co.estado };
      }
    }

    return {
      id: row.id,
      orderId: row.orderId,
      clienteId: row.clienteId,
      clienteNombre: row.clienteNombre,
      asesorId: row.asesorId,
      asesorNombre: row.asesorNombre,
      fechaVenta: row.fechaVenta.toISOString(),
      subtotal: Number(row.subtotal),
      impuestos: Number(row.impuestos),
      descuentos: Number(row.descuentos),
      total: Number(row.total),
      estado: row.estado,
      motivoAnulacion: row.motivoAnulacion ?? undefined,
      medioPago: row.medioPago ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      order: {
        id: orderRow?.id ?? '',
        numero: orderRow?.numero ?? '',
        estado: orderRow?.estado ?? '',
        tipoFlujo: orderRow?.tipoFlujo ?? '',
        fecha: orderRow?.fecha?.toISOString() ?? '',
        medioPago: orderRow?.medioPago ?? undefined,
        items,
        payment: payments[0]
          ? {
              id: payments[0].id,
              amount: Number(payments[0].amount),
              status: payments[0].status,
              method: payments[0].method,
              paidAt: payments[0].paidAt?.toISOString() ?? null,
            }
          : null,
        receipt: receipts[0]
          ? {
              id: receipts[0].id,
              numero: receipts[0].numero,
              estado: receipts[0].estado,
              estadoEnvio: receipts[0].estadoEnvio ?? null,
            }
          : null,
         customOrder,
      },
     };
  }

  toDbOrderStatus(status: string): DbOrderStatus | undefined {
    const map: Record<string, DbOrderStatus> = {
      Pendiente: 'PENDIENTE',
      Aceptado: 'ACEPTADO',
      Listo: 'LISTO',
      Enviado: 'DESPACHADO',
      Entregado: 'ENTREGADO',
      Rechazado: 'RECHAZADO',
      'En validación': 'EN_VALIDACION',
      'Recibo generado': 'RECIBO_GENERADO',
      'Recibo enviado': 'RECIBO_ENVIADO',
      Cancelado: 'CANCELADO',
    };
    return map[status];
  }

  dbToOrderStatus(db: DbOrderStatus): string {
    const map: Record<DbOrderStatus, string> = {
      NUEVO: 'Pendiente',
      EN_PRODUCCION: 'Listo',
      LISTO: 'Listo',
      DESPACHADO: 'Enviado',
      EN_CAMINO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      PENDIENTE: 'Pendiente',
      EN_VALIDACION: 'En validación',
      ACEPTADO: 'Aceptado',
      RECHAZADO: 'Rechazado',
      RECIBO_GENERADO: 'Recibo generado',
      RECIBO_ENVIADO: 'Recibo enviado',
    };
    return map[db];
  }
}
