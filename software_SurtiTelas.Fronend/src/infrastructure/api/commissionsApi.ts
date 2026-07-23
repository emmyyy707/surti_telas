import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

export interface CommissionDTO {
  id: string;
  asesorId: string;
  orderId?: string;
  monto: number;
  porcentaje: number;
  estado: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  asesorId: string;
  orderId?: string;
  monto: number;
  porcentaje: number;
  estado: 'Pendiente' | 'Pagado' | 'Cancelado';
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export function toCommission(dto: CommissionDTO): Commission {
  return {
    id: dto.id,
    asesorId: dto.asesorId,
    orderId: dto.orderId,
    monto: Number(dto.monto),
    porcentaje: Number(dto.porcentaje),
    estado: dto.estado === 'pendiente' ? 'Pendiente' : dto.estado === 'pagado' ? 'Pagado' : 'Cancelado',
    notas: dto.notas,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const commissionsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Commission[]> {
    const response = await api.get<{ items: CommissionDTO[]; meta: Record<string, unknown> }>('/commissions', { query });
    return (response?.items ?? []).map(toCommission);
  },

  async getById(id: string): Promise<Commission | null> {
    try {
      const dto = await api.get<CommissionDTO>(`/commissions/${encodeURIComponent(id)}`);
      return dto ? toCommission(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: Partial<Commission>): Promise<Commission> {
    const body: Record<string, unknown> = {
      asesorId: data.asesorId,
      orderId: data.orderId,
      monto: data.monto,
      porcentaje: data.porcentaje,
      notas: data.notas,
    };
    const dto = await api.post<CommissionDTO>('/commissions', body);
    return toCommission(dto);
  },
};
