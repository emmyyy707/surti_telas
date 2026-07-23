import { api } from './httpClient';

export interface ReceiptDTO {
  id: string;
  orderId?: string;
  customerId: string;
  numero: string;
  total: number;
  concepto?: string;
  pagos?: Array<{ id: string; amount: number; method: string }>;
  createdAt: string;
}

export interface Receipt {
  id: string;
  orderId?: string;
  customerId: string;
  numero: string;
  total: number;
  concepto?: string;
  pagos?: Array<{ id: string; amount: number; method: string }>;
  createdAt: string;
}

export function toReceipt(dto: ReceiptDTO): Receipt {
  return {
    id: dto.id,
    orderId: dto.orderId,
    customerId: dto.customerId,
    numero: dto.numero,
    total: Number(dto.total),
    concepto: dto.concepto,
    pagos: dto.pagos,
    createdAt: dto.createdAt,
  };
}

export const receiptsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Receipt[]> {
    const response = await api.get<{ items: ReceiptDTO[]; meta: Record<string, unknown> }>('/receipts', { query });
    const data = response?.items ?? [];
    return data.map(toReceipt);
  },

  async listMine(): Promise<Receipt[]> {
    const response = await api.get<{ items: ReceiptDTO[]; meta: Record<string, unknown> }>('/receipts/me');
    const data = response?.items ?? [];
    return data.map(toReceipt);
  },

  async getById(id: string): Promise<Receipt | null> {
    try {
      const dto = await api.get<ReceiptDTO>(`/receipts/${encodeURIComponent(id)}`);
      return dto ? toReceipt(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: Partial<Receipt>): Promise<Receipt> {
    const body: Record<string, unknown> = {
      orderId: data.orderId,
      customerId: data.customerId,
      numero: data.numero,
      total: data.total,
      concepto: data.concepto,
    };
    const dto = await api.post<ReceiptDTO>('/receipts', body);
    return toReceipt(dto);
  },

  async update(id: string, changes: Partial<Receipt>): Promise<Receipt> {
    const dto = await api.patch<ReceiptDTO>(`/receipts/${encodeURIComponent(id)}`, changes);
    return toReceipt(dto);
  },

  async updateStatus(id: string, estado: string): Promise<Receipt> {
    const dto = await api.patch<ReceiptDTO>(`/receipts/${encodeURIComponent(id)}/status`, { estado });
    return toReceipt(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/receipts/${encodeURIComponent(id)}`);
  },
};
