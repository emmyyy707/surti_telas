import { prisma } from '../../../../config/database';
import type { SaleWithOrder } from '../../domain/repositories/SaleRepository';

export interface SalesListFilter {
  search?: string;
  estado?: string;
  clienteId?: string;
  asesorId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  /** Filtra ventas de un pedido específico. */
  orderId?: string;
  /** Filtra por estado del pago (APPROVED, REFUNDED, ANULADO, etc.). */
  paymentStatus?: string;
  /** Filtra por tipo de pago (PAGO_INMEDIATO, ABONO_INICIAL, CUOTA, PAGO_SALDO). */
  tipoPago?: string;
  /** Filtra por número de cuota. */
  numeroCuota?: number;
  /** Filtra por medio de pago. */
  medioPago?: string;
}

export interface SalesListResult {
  items: SaleWithOrder[];
  total: number;
  page: number;
  limit: number;
}

export class GetSales {
  constructor(private readonly prismaClient: typeof prisma) {}

  async execute(filters: SalesListFilter = {}): Promise<SalesListResult> {
    const {
      search,
      estado,
      clienteId,
      asesorId,
      desde,
      hasta,
      page = 1,
      limit = 50,
      orderId,
      paymentStatus,
      tipoPago,
      numeroCuota,
      medioPago,
    } = filters;

    const where: Record<string, unknown> = { deletedAt: null };

    if (estado) {
      where.estado = estado;
    }
    if (asesorId) {
      where.asesorId = asesorId;
    }
    if (orderId) {
      where.orderId = orderId;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (tipoPago) {
      where.tipoPago = tipoPago;
    }
    if (typeof numeroCuota === 'number') {
      where.numeroCuota = numeroCuota;
    }
    if (medioPago) {
      where.medioPago = medioPago;
    }
    if (desde || hasta) {
      where.fechaVenta = {};
      if (desde) (where.fechaVenta as Record<string, Date>).gte = new Date(desde);
      if (hasta) (where.fechaVenta as Record<string, Date>).lte = new Date(hasta);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchConditions: Array<Record<string, unknown>> = [
        { clienteNombre: { contains: searchTerm, mode: 'insensitive' } },
        { asesorNombre: { contains: searchTerm, mode: 'insensitive' } },
        { order: { numero: { contains: searchTerm } } },
      ];

      if (clienteId) {
        searchConditions.push({ clienteId });
        searchConditions.push({ clienteNombre: { equals: clienteId, mode: 'insensitive' } });
      }

      where.AND = [
        { deletedAt: null },
        { OR: searchConditions },
      ];
      delete where.deletedAt;
    } else if (clienteId) {
      where.clienteId = clienteId;
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await this.prismaClient.$transaction([
      this.prismaClient.sale.findMany({
        where,
        include: {
          order: {
            include: {
              items: true,
              payments: { where: { deletedAt: null } },
              receipts: { where: { deletedAt: null } },
              custom_orders: {
                select: { id: true, numero: true, estado: true },
                where: { deleted_at: null },
              },
            },
          },
        },
        orderBy: { fechaVenta: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaClient.sale.count({ where }),
    ]);

    const items: SaleWithOrder[] = rows.map((row) => this.toSaleWithOrder(row));

    return { items, total, page, limit };
  }

  private toSaleWithOrder(row: {
    id: string;
    orderId: string;
    clienteId: string;
    clienteNombre: string;
    asesorId: string;
    asesorNombre: string;
    fechaVenta: Date;
    subtotal: { toNumber(): number };
    impuestos: { toNumber(): number };
    descuentos: { toNumber(): number };
    total: { toNumber(): number };
    estado: string;
    motivoAnulacion: string | null;
    medioPago: string | null;
    createdAt: Date;
    updatedAt: Date;
    paymentId: string | null;
    tipoPago: string | null;
    numeroCuota: number | null;
    totalCuotas: number | null;
    esAnticipo: boolean | null;
    esSaldo: boolean | null;
    paymentStatus: string | null;
    comprobantePagoUrl: string | null;
    registradoPorId: string | null;
    order: {
      id: string;
      numero: string;
      estado: string;
      tipoFlujo: string;
      fecha: Date;
      medioPago: string | null;
      items: Array<{ id: string; nombre: string; precio: { toNumber(): number }; cantidad: number; productId: string | null }>;
       payments: Array<{ id: string; amount: { toNumber(): number }; status: string; method: string; paidAt: Date | null }>;
       receipts: Array<{ id: string; numero: string; estado: string; estadoEnvio: string | null }>;
       custom_orders?: { id: string; numero: string; estado: string } | null;
     } | null;
   } | null): SaleWithOrder {
    return {
      id: row!.id,
      orderId: row!.orderId,
      clienteId: row!.clienteId,
      clienteNombre: row!.clienteNombre,
      asesorId: row!.asesorId,
      asesorNombre: row!.asesorNombre,
      fechaVenta: row!.fechaVenta.toISOString(),
      subtotal: Number((row!.subtotal as { toNumber: () => number }).toNumber()),
      impuestos: Number((row!.impuestos as { toNumber: () => number }).toNumber()),
      descuentos: Number((row!.descuentos as { toNumber: () => number }).toNumber()),
      total: Number((row!.total as { toNumber: () => number }).toNumber()),
      estado: row!.estado,
      motivoAnulacion: row!.motivoAnulacion ?? undefined,
      medioPago: row!.medioPago ?? undefined,
      createdAt: row!.createdAt.toISOString(),
      updatedAt: row!.updatedAt.toISOString(),
      paymentId: row!.paymentId ?? null,
      tipoPago: row!.tipoPago ?? null,
      numeroCuota: row!.numeroCuota ?? null,
      totalCuotas: row!.totalCuotas ?? null,
      esAnticipo: row!.esAnticipo ?? null,
      esSaldo: row!.esSaldo ?? null,
      paymentStatus: row!.paymentStatus ?? null,
      comprobantePagoUrl: row!.comprobantePagoUrl ?? null,
      registradoPorId: row!.registradoPorId ?? null,
      order: row!.order
        ? {
            id: row!.order.id,
            numero: row!.order.numero,
            estado: row!.order.estado,
            tipoFlujo: row!.order.tipoFlujo,
            fecha: row!.order.fecha.toISOString(),
            medioPago: row!.order.medioPago ?? undefined,
            items: row!.order.items.map((i) => ({
              id: i.id,
              nombre: i.nombre,
              precio: Number((i.precio as { toNumber: () => number }).toNumber()),
              cantidad: i.cantidad,
              productId: i.productId ?? null,
            })),
            payment: row!.order.payments?.[0]
              ? {
                  id: row!.order.payments[0].id,
                  amount: Number((row!.order.payments[0].amount as { toNumber: () => number }).toNumber()),
                  status: row!.order.payments[0].status,
                  method: row!.order.payments[0].method,
                  paidAt: row!.order.payments[0].paidAt?.toISOString() ?? null,
                }
              : null,
            receipt: row!.order.receipts?.[0]
              ? {
                  id: row!.order.receipts[0].id,
                  numero: row!.order.receipts[0].numero,
                  estado: row!.order.receipts[0].estado,
                  estadoEnvio: row!.order.receipts[0].estadoEnvio ?? null,
                }
              : null,
            customOrder: row!.order.custom_orders
              ? {
                  id: row!.order.custom_orders.id,
                  numero: row!.order.custom_orders.numero,
                  estado: row!.order.custom_orders.estado,
                }
              : null,
          }
        : (true as unknown as SaleWithOrder['order']),
    };
  }
}
