import { api } from './httpClient';

export interface InsumoDTO {
  id: string;
  nombre: string;
  unidadMedida: string;
  precioUnitario: number;
  stockActual?: number;
  categoria?: string | null;
}

export interface InsumosListResult {
  items: InsumoDTO[];
  meta: {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
    nextCursor?: string;
  };
}

export const insumosApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<InsumosListResult> {
    const response = await api.get<{
      items: InsumoDTO[];
      meta: { totalRecords: number; page: number; limit: number; totalPages: number; nextCursor?: string };
    }>('/stock/raw-materials', { query });
    return {
      items: response?.items ?? [],
      meta: response?.meta ?? { totalRecords: 0, page: 1, limit: 100, totalPages: 1 },
    };
  },
};

export default insumosApi;
