import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

export class AlertInventoryService {
  async checkLowStock(): Promise<void> {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        cantidadStock: { lte: 5 },
        deletedAt: null,
      },
      include: { categoria: true },
    });

    for (const product of lowStockProducts) {
      logger.info('[Alert] Low stock detected', { productId: product.id, nombre: product.nombre, stock: product.cantidadStock });
    }

    return;
  }

  async getProductRecommendations(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return [];

    const recommendedQuantity = Math.max(10, (5) * 2 - (product.cantidadStock ?? 0));

    const supplier = await prisma.supplier.findFirst({
      where: { deletedAt: null },
      select: { nombre: true },
    });

    return [{
      productId: product.id,
      nombre: product.nombre,
      cantidadRecomendada: recommendedQuantity,
      proveedor: supplier?.nombre || 'Sin proveedor asignado',
    }];
  }
}
