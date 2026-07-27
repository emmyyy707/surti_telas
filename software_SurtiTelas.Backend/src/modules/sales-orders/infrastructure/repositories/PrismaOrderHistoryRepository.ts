import { PrismaClient } from '@prisma/client';
import { OrderHistory, type OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import { toOrderHistory } from '../mappers/OrderHistoryMapper';

export class PrismaOrderHistoryRepository implements OrderHistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(history: Omit<OrderHistory, 'id' | 'createdAt'>): Promise<OrderHistory> {
    const row = await this.prisma.orderHistory.create({
      data: {
        pedidoId: history.pedidoId,
        usuarioId: history.usuarioId,
        accion: history.accion,
        estadoAnterior: history.estadoAnterior,
        estadoNuevo: history.estadoNuevo,
        razon: history.razon,
        informacion: history.informacion as any,
      },
    });
    return toOrderHistory({
      id: row.id,
      pedidoId: row.pedidoId,
      usuarioId: row.usuarioId ?? undefined,
      usuarioNombre: null,
      accion: row.accion,
      estadoAnterior: row.estadoAnterior,
      estadoNuevo: row.estadoNuevo,
      razon: row.razon ?? undefined,
      informacion: row.informacion as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
    });
  }

  async findByPedidoId(pedidoId: string): Promise<OrderHistory[]> {
    const rows = await this.prisma.orderHistory.findMany({
      where: { pedidoId, deletedAt: null },
      include: { usuario: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toOrderHistory);
  }
}
