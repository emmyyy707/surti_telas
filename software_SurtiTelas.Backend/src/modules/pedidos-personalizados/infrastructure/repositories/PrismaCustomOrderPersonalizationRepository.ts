import { Prisma, PrismaClient } from '@prisma/client';
import type { CustomOrderPersonalizationRepository } from '../../domain/repositories/CustomOrderRepository';

export class PrismaCustomOrderPersonalizationRepository implements CustomOrderPersonalizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createManyByItemId(itemId: string, personalizaciones: any[], tx?: any): Promise<void> {
    const prisma = tx ?? this.prisma;
    const payload = personalizaciones.map((p) => ({
      custom_order_item_id: itemId,
      tipo: p.tipo,
      tecnica: p.tecnica ?? null,
      ubicacion: p.ubicacion ?? [],
      descripcion: p.descripcion,
      archivos: p.archivos ?? [],
      orden: p.orden ?? 0,
    }));

    await prisma.personalizations.createMany({
      data: payload as unknown as Prisma.personalizationsCreateManyInput[],
    });
  }

  async findByItemId(itemId: string, tx?: any): Promise<any[]> {
    const prisma = tx ?? this.prisma;
    return prisma.personalizations.findMany({
      where: { custom_order_item_id: itemId, deleted_at: null },
      include: {
        variants: {
          where: { deleted_at: null },
        },
      },
      orderBy: { orden: 'asc' },
    });
  }
}
