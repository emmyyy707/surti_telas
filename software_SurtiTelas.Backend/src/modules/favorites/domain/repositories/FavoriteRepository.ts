import { Favorite } from '../entities/Favorite';

export interface FavoriteRepository {
  listByUser(userId: string): Promise<Favorite[]>;
  toggle(userId: string, productId: string): Promise<Favorite | null>;
  exists(userId: string, productId: string): Promise<boolean>;
}
