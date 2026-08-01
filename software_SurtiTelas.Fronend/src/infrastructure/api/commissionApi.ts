import { api } from './httpClient';

export interface CommissionReport {
  asesorId: string;
  asesorNombre: string;
  totalVentas: number;
  comisionTotal: number;
  ventasCount: number;
}

export interface CommissionResult {
  data: CommissionReport[];
  totalComisiones: number;
}

export const commissionApi = {
  getReport: (filters?: { asesorId?: string; desde?: string; hasta?: string }) =>
    api.get<CommissionResult>('/admin/commissions/report', { query: filters as Record<string, string> }),
};
