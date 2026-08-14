import type { CustomOrderFilters, CustomOrderListResult, CustomOrderRepository } from '../../domain/repositories/CustomOrderRepository';
import { toPedidoPersonalizado, toCreatePedidoInput, toUpdatePedidoInput } from '../mappers/CustomOrderMapper';
import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';

export class PrismaCustomOrderRepository implements CustomOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: CustomOrderFilters = {}): Promise<CustomOrderListResult> {
    const where: Prisma.custom_ordersWhereInput = { deleted_at: null };
    if (filters.estado) where.estado = filters.estado as any;
    if (filters.clienteId) where.cliente_id = filters.clienteId;
    if (filters.asesorId) where.asesor_id = filters.asesorId;
    if (filters.search) {
      where.OR = [
        { numero: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.custom_orders.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customers: true,
          custom_order_attachments: true,
          custom_order_notes: true,
          custom_order_items: {
            where: { deleted_at: null },
            include: {
              personalizations: {
                where: { deleted_at: null },
                include: {
                  variants: {
                    where: { deleted_at: null },
                  },
                },
              },
            },
            orderBy: { orden: 'asc' },
          },
          quotes: { include: { quote_items: true } },
        },
      }),
      this.prisma.custom_orders.count({ where }),
    ]);

    return {
      data: rows.map((r: any) => toPedidoPersonalizado(r)),
      meta: { total, page, limit },
    };
  }

  async getById(id: string) {
    const row = await this.prisma.custom_orders.findFirst({
      where: { id, deleted_at: null },
      include: {
        customers: true,
        custom_order_attachments: true,
        custom_order_notes: true,
        custom_order_items: {
          where: { deleted_at: null },
          include: {
            personalizations: {
              where: { deleted_at: null },
              include: {
                variants: {
                  where: { deleted_at: null },
                },
              },
            },
          },
          orderBy: { orden: 'asc' },
        },
        quotes: { include: { quote_items: true } },
      },
    });
    return row ? toPedidoPersonalizado(row) : null;
  }

  async getByNumero(numero: string) {
    const row = await this.prisma.custom_orders.findFirst({
      where: { numero, deleted_at: null },
      include: {
        customers: true,
        custom_order_attachments: true,
        custom_order_notes: true,
        custom_order_items: {
          where: { deleted_at: null },
          include: {
            personalizations: {
              where: { deleted_at: null },
              include: {
                variants: {
                  where: { deleted_at: null },
                },
              },
            },
          },
          orderBy: { orden: 'asc' },
        },
        quotes: { include: { quote_items: true } },
      },
    });
    return row ? toPedidoPersonalizado(row) : null;
  }

  async create(data: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    const row = await prisma.custom_orders.create({
      data: toCreatePedidoInput(data) as unknown as Prisma.custom_ordersCreateInput,
      include: {
        customers: true,
        custom_order_attachments: true,
        custom_order_notes: true,
        custom_order_items: {
          where: { deleted_at: null },
          include: {
            personalizations: {
              where: { deleted_at: null },
              include: {
                variants: {
                  where: { deleted_at: null },
                },
              },
            },
          },
        },
        quotes: { include: { quote_items: true } },
      },
    });
    return toPedidoPersonalizado(row);
  }

  async update(id: string, changes: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    try {
      const row = await prisma.custom_orders.update({
        where: { id },
        data: toUpdatePedidoInput(changes) as Prisma.custom_ordersUpdateInput,
        include: {
          customers: true,
          custom_order_attachments: true,
          custom_order_notes: true,
          custom_order_items: {
            where: { deleted_at: null },
            include: {
              personalizations: {
                where: { deleted_at: null },
                include: {
                  variants: {
                    where: { deleted_at: null },
                  },
                },
              },
            },
          },
          quotes: { include: { quote_items: true } },
        },
      });
      return toPedidoPersonalizado(row);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
      }
      throw error;
    }
  }

  async nextNumero(): Promise<string> {
    const last = await this.prisma.custom_orders.findFirst({
      where: { numero: { startsWith: 'SOL-' } },
      orderBy: { createdAt: 'desc' },
      select: { numero: true },
    });
    let seq = 1;
    if (last?.numero) {
      const match = /SOL-(\d+)/.exec(last.numero);
      if (match) seq = parseInt(match[1], 10) + 1;
    }
    return `SOL-${String(seq).padStart(4, '0')}`;
  }
}
