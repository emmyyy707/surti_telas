import { api } from './httpClient';

export interface PurchaseDTO {
  id: string;
  numero: string;
  proveedorId: string;
  usuarioId: string;
  fecha: string;
  total: number;
  estado: 'PENDIENTE' | 'RECIBIDA' | 'CANCELADA' | 'ANULADA';
  observaciones?: string;
  motivoCancelacion?: string;
  items?: PurchaseItemDTO[];
}

export interface PurchaseItemDTO {
  id: string;
  purchaseId: string;
  rawMaterialId?: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PurchasesListResult {
  items: PurchaseDTO[];
  meta: {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
    nextCursor?: string;
  };
}

export const purchasesApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<PurchasesListResult> {
    const response = await api.get<{ items: PurchaseDTO[]; meta: { totalRecords: number; page: number; limit: number; totalPages: number; nextCursor?: string } }>('/purchases', { query });
    return {
      items: response?.items ?? [],
      meta: response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  async getById(id: string): Promise<PurchaseDTO | null> {
    try {
      const data = await api.get<PurchaseDTO>(`/purchases/${encodeURIComponent(id)}`, { auth: true });
      return data;
    } catch {
      return null;
    }
  },

  async create(data: { numero: string; proveedorId: string; usuarioId: string; total: number; observaciones?: string; items: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }[] }): Promise<PurchaseDTO> {
    return api.post<PurchaseDTO>('/purchases', data);
  },

  async update(id: string, changes: { observaciones?: string; estado?: string }): Promise<PurchaseDTO> {
    return api.patch<PurchaseDTO>(`/purchases/${encodeURIComponent(id)}`, changes);
  },

  async cancel(id: string, motivo: string): Promise<PurchaseDTO> {
    return api.post<PurchaseDTO>(`/purchases/${encodeURIComponent(id)}/cancel`, { motivo });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/purchases/${encodeURIComponent(id)}`);
  },

  async addItem(purchaseId: string, item: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }): Promise<PurchaseItemDTO> {
    return api.post<PurchaseItemDTO>(`/purchases/${encodeURIComponent(purchaseId)}/items`, item);
  },

  async removeItem(purchaseId: string, itemId: string): Promise<void> {
    await api.delete(`/purchases/${encodeURIComponent(purchaseId)}/items/${encodeURIComponent(itemId)}`);
  },

  async getItems(purchaseId: string): Promise<PurchaseItemDTO[]> {
    const data = await api.get<PurchaseItemDTO[]>(`/purchases/${encodeURIComponent(purchaseId)}/items`, { auth: true });
    return data ?? [];
  },

  async exportPdf(id: string): Promise<Blob> {
    const response = await fetch(`${(import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')}/purchases/${encodeURIComponent(id)}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
      },
    });
    if (!response.ok) throw new Error('No se pudo generar el PDF');
    return response.blob();
  },
};
