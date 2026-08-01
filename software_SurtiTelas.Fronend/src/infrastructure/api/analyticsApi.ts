import { api } from './httpClient';

export interface AnalyticsFilters {
  desde?: string;
  hasta?: string;
  asesorId?: string;
  clienteId?: string;
  estado?: string;
  tipoFlujo?: string;
}

export interface KPIData {
  totalPedidos: number;
  totalVentas: number;
  totalClientes: number;
  ingresosTotales: number;
  ticketPromedio: number;
  pedidosPorEstado: Array<{ estado: string; cantidad: number }>;
  ventasPorAsesor: Array<{ asesorId: string; total: number; cantidad: number }>;
  tendenciaDiaria: Array<{ fecha: string; ventas: number; total: number }>;
  topProductos: Array<{ nombre: string; cantidad: number; total: number }>;
  topClientes: Array<{ cliente: string; cantidad: number; total: number }>;
}

export interface ComparisonResult {
  currentPeriodo: { total: number; pedidos: number; promedio: number };
  previousPeriodo: { total: number; pedidos: number; promedio: number };
  crecimiento: { porcentaje: number; absoluto: number };
}

export const analyticsApi = {
  getDashboard: (filters?: AnalyticsFilters) =>
    api.get<KPIData>('/analytics/dashboard', { query: filters as Record<string, string> }),

  getComparison: (filters?: AnalyticsFilters) =>
    api.get<ComparisonResult>('/analytics/comparison', { query: filters as Record<string, string> }),
};
