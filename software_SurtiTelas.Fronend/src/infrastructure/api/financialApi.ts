import { api } from './httpClient';

export interface FinancialReport {
  ingresosTotales: number;
  gastosTotales: number;
  utilidadNeta: number;
  margenUtilidad: number;
  cuentasPorCobrar: number;
  cuentasPorPagar: number;
  flujoCaja: number;
  ventasPorProducto: Array<{ producto: string; total: number; cantidad: number }>;
  ventasPorAsesor: Array<{ asesor: string; total: number; comision: number }>;
}

export const financialApi = {
  getReport: (filters?: { desde?: string; hasta?: string }) =>
    api.get<FinancialReport>('/admin/financial/report', { query: filters as Record<string, string> }),
};
