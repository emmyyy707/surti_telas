import { Favorite } from '../../domain/entities/Favorite';
import type { Prisma } from '@prisma/client';

type FavoriteRow = Prisma.FavoriteGetPayload<object>;

export function toFavorite(row: FavoriteRow): Favorite {
  return new Favorite({
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    createdAt: row.createdAt,
  });
}
