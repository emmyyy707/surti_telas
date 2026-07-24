import { catalogApi } from './catalogApi';
import type { Producto } from '@/core/types';

const FAVORITES_STORAGE_KEY = 'surtitelas.favorites';

const readFavorites = (): string[] => {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && id.trim() !== '') : [];
  } catch {
    return [];
  }
};

const writeFavorites = (favoriteIds: string[]) => {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
};

export const favoritesApi = {
  async list(): Promise<Producto[]> {
    const favoriteIds = readFavorites();
    if (favoriteIds.length === 0) return [];

    const result = await catalogApi.list();
    const productsById = new Map(result.data.map(p => [p.id || p.ref, p]));

    return favoriteIds
      .map(id => productsById.get(id))
      .filter((p): p is Producto => Boolean(p));
  },

  toggle(productId: string): void {
    const current = readFavorites();
    const next = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    writeFavorites(next);
  },

  isFavorite(productId: string): boolean {
    return readFavorites().includes(productId);
  },
};
