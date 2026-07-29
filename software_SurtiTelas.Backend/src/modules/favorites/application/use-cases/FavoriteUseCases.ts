import { FavoriteRepository } from '../../domain/repositories/FavoriteRepository';
import { Favorite } from '../../domain/entities/Favorite';

export class ListFavorites {
  constructor(private readonly repo: FavoriteRepository) {}

  async execute(userId: string): Promise<Favorite[]> {
    return this.repo.listByUser(userId);
  }
}

export class ToggleFavorite {
  constructor(private readonly repo: FavoriteRepository) {}

  async execute(userId: string, productId: string): Promise<Favorite | null> {
    const exists = await this.repo.exists(userId, productId);
    if (exists) {
      return this.repo.toggle(userId, productId);
    }
    return this.repo.toggle(userId, productId);
  }
}
