import { PrismaClient } from '@prisma/client';
import type { CustomOrderHistoryRepository } from '../../domain/repositories/CustomOrderRepository';

export class PrismaCustomOrderHistoryRepository implements CustomOrderHistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    customOrderId: string;
    usuarioId?: string;
    accion: string;
    estadoAnterior: string;
    estadoNuevo: string;
    razon?: string;
    informacion?: any;
  }) {
    return this.prisma.custom_order_history.create({
      data: {
        customOrderId: data.customOrderId,
        usuarioId: data.usuarioId,
        accion: data.accion,
        estadoAnterior: data.estadoAnterior,
        estadoNuevo: data.estadoNuevo,
        razon: data.razon ?? null,
        informacion: data.informacion ?? null,
      },
    });
  }

  async findByCustomOrderId(customOrderId: string) {
    return this.prisma.custom_order_history.findMany({
      where: { customOrderId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
