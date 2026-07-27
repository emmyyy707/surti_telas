import { PrismaClient } from '@prisma/client';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import { OrderHistory } from '../../domain/entities/OrderHistory';
import type { OrderHistoryData } from '../../domain/entities/OrderHistory';

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

    const data: OrderHistoryData = {
      id: row.id,
      pedidoId: row.pedidoId,
      usuarioId: row.usuarioId ?? undefined,
      accion: row.accion,
      estadoAnterior: row.estadoAnterior,
      estadoNuevo: row.estadoNuevo,
      razon: row.razon ?? undefined,
      informacion: row.informacion as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
    };

    return new OrderHistory(data);
  }

  async findByPedidoId(pedidoId: string): Promise<OrderHistory[]> {
    const rows = await this.prisma.orderHistory.findMany({
      where: { pedidoId, deletedAt: null },
      include: { usuario: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => {
      const data: OrderHistoryData = {
        id: row.id,
        pedidoId: row.pedidoId,
        usuarioId: row.usuarioId ?? undefined,
        usuarioNombre: row.usuario?.nombre,
        accion: row.accion,
        estadoAnterior: row.estadoAnterior,
        estadoNuevo: row.estadoNuevo,
        razon: row.razon ?? undefined,
        informacion: row.informacion as Record<string, unknown> | undefined,
        createdAt: row.createdAt.toISOString(),
      };
      return new OrderHistory(data);
    });
  }
}
