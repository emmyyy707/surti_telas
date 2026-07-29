import { PrismaClient } from '@prisma/client';
import { Favorite } from '../../domain/entities/Favorite';
import type { FavoriteRepository } from '../../domain/repositories/FavoriteRepository';
import { toFavorite } from '../mappers/FavoriteMapper';

export class PrismaFavoriteRepository implements FavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByUser(userId: string): Promise<Favorite[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toFavorite);
  }

  async toggle(userId: string, productId: string): Promise<Favorite | null> {
    const exists = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (exists) {
      await this.prisma.favorite.delete({
        where: { userId_productId: { userId, productId } },
      });
      return null;
    }

    const row = await this.prisma.favorite.create({
      data: { userId, productId },
    });
    return toFavorite(row);
  }

  async exists(userId: string, productId: string): Promise<boolean> {
    const count = await this.prisma.favorite.count({
      where: { userId, productId },
    });
    return count > 0;
  }
}
