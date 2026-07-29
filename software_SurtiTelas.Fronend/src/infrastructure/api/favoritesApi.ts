import { api } from './httpClient';
import type { Producto } from '@/core/types';

export const favoritesApi = {
  async list(): Promise<Producto[]> {
    const response = await api.get<Producto[]>('/favorites');
    return response ?? [];
  },

  async toggle(productId: string): Promise<void> {
    await api.post<void>(`/favorites/${encodeURIComponent(productId)}/toggle`);
  },

  async isFavorite(productId: string): Promise<boolean> {
    const response = await api.get<Producto[]>('/favorites');
    return response.some((product) => product.id === productId);
  },
};
