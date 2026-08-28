import { api } from './httpClient';

export interface CategoryDTO {
  id: string;
  nombre: string;
  slug: string;
  parentId?: string | null;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface CategoryWithStockDTO extends CategoryDTO {
  totalProductos: number;
  productosBajoStock: number;
  productosAgotados: number;
}

export interface CategoriesListResult {
  data: CategoryDTO[];
  meta: {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
    nextCursor?: string;
  };
}

export const categoriesApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<CategoriesListResult> {
    const response = await api.get<{ items: CategoryDTO[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor?: string | null }>('/catalog/categories', { query, auth: false });
    return {
      data: response?.items ?? [],
      meta: {
        totalRecords: response?.totalRecords ?? 0,
        page: response?.page ?? 1,
        limit: response?.limit ?? 100,
        totalPages: response?.totalPages ?? 1,
        nextCursor: response?.nextCursor ?? undefined,
      },
    };
  },

  async getById(id: string): Promise<CategoryDTO | null> {
    try {
      const data = await api.get<CategoryDTO>(`/catalog/categories/${encodeURIComponent(id)}`, { auth: true });
      return data;
    } catch {
      return null;
    }
  },

  async create(input: { nombre: string; slug: string; parentId?: string | null }): Promise<CategoryDTO> {
    return api.post<CategoryDTO>('/catalog/categories', input);
  },

  async update(id: string, changes: { nombre?: string; slug?: string; parentId?: string | null; estado?: 'ACTIVO' | 'INACTIVO' }): Promise<CategoryDTO> {
    return api.patch<CategoryDTO>(`/catalog/categories/${encodeURIComponent(id)}`, changes);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/catalog/categories/${encodeURIComponent(id)}`);
  },

  async getWithLowStock(): Promise<CategoryWithStockDTO[]> {
    const data = await api.get<CategoryWithStockDTO[]>('/catalog/categories/stock-status', { auth: false });
    return data;
  },
};
