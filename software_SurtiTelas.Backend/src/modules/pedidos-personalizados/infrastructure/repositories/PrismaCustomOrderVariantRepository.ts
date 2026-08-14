import { Prisma, PrismaClient } from '@prisma/client';
import type { CustomOrderVariantRepository } from '../../domain/repositories/CustomOrderRepository';

export class PrismaCustomOrderVariantRepository implements CustomOrderVariantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createManyByPersonalizationId(personalizationId: string, variants: any[], tx?: any): Promise<void> {
    const prisma = tx ?? this.prisma;
    const payload = variants.map((v) => ({
      custom_order_personalization_id: personalizationId,
      talla: v.talla,
      color: v.color,
      cantidad: Number(v.cantidad ?? 0),
    }));

    await prisma.variants.createMany({
      data: payload as unknown as Prisma.variantsCreateManyInput[],
    });
  }

  async findByPersonalizationId(personalizationId: string, tx?: any): Promise<any[]> {
    const prisma = tx ?? this.prisma;
    return prisma.variants.findMany({
      where: { custom_order_personalization_id: personalizationId, deleted_at: null },
      orderBy: { createdAt: 'asc' },
    });
  }
}
