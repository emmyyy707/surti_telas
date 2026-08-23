import { api } from './httpClient';

export interface RawMaterialCategoryDTO {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  estado: string;
}

export interface RawMaterialCategoriesListResult {
  items: RawMaterialCategoryDTO[];
  meta: {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
    nextCursor?: string;
  };
}

export const rawMaterialCategoriesApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<RawMaterialCategoriesListResult> {
    const response = await api.get<{ items: RawMaterialCategoryDTO[]; meta: { totalRecords: number; page: number; limit: number; totalPages: number; nextCursor?: string } }>('/raw-material-categories', { query });
    return {
      items: response?.items ?? [],
      meta: response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  async getById(id: string): Promise<RawMaterialCategoryDTO | null> {
    try {
      const data = await api.get<RawMaterialCategoryDTO>(`/raw-material-categories/${encodeURIComponent(id)}`, { auth: true });
      return data;
    } catch {
      return null;
    }
  },

  async create(data: { nombre: string; slug: string; descripcion?: string; estado?: string }): Promise<RawMaterialCategoryDTO> {
    return api.post<RawMaterialCategoryDTO>('/raw-material-categories', data);
  },

  async update(id: string, changes: { nombre?: string; slug?: string; descripcion?: string; estado?: string }): Promise<RawMaterialCategoryDTO> {
    return api.patch<RawMaterialCategoryDTO>(`/raw-material-categories/${encodeURIComponent(id)}`, changes);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/raw-material-categories/${encodeURIComponent(id)}`);
  },
};
