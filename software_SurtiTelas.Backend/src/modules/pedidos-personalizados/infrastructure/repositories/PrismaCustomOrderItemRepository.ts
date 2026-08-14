import { Prisma, PrismaClient } from '@prisma/client';
import type { CustomOrderItemRepository } from '../../domain/repositories/CustomOrderRepository';

export class PrismaCustomOrderItemRepository implements CustomOrderItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createManyByPedidoId(pedidoPersonalizadoId: string, items: any[], tx?: any): Promise<void> {
    const prisma = tx ?? this.prisma;
    const payload = items.map((item) => ({
      custom_order_id: pedidoPersonalizadoId,
      producto_id: item.productoId ?? null,
      producto_nombre: item.productoNombre ?? null,
      descripcion: item.descripcion || 'Item',
      tipo_personalizacion: item.tipoPersonalizacion || 'OTRO',
      especificaciones: item.especificaciones ?? null,
      cantidad: Number(item.cantidad ?? 0),
      talla: item.talla ?? null,
      color: item.color ?? null,
      material: item.material ?? null,
      ubicacion: item.ubicacion ?? [],
      orden: item.orden ?? 0,
    }));

    await prisma.custom_order_items.createMany({
      data: payload as unknown as Prisma.custom_order_itemsCreateManyInput[],
    });
  }

  async findByPedidoId(pedidoPersonalizadoId: string, tx?: any): Promise<any[]> {
    const prisma = tx ?? this.prisma;
    return prisma.custom_order_items.findMany({
      where: { custom_order_id: pedidoPersonalizadoId, deleted_at: null },
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
    });
  }
}
