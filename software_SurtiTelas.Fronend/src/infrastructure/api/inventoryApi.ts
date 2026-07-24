import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

export interface InventoryMovementDTO {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  productId?: string;
  rawMaterialId?: string;
  cantidad: number;
  ajuste?: number;
  motivo: string;
  usuarioId: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  productId?: string;
  rawMaterialId?: string;
  cantidad: number;
  ajuste?: number;
  motivo: string;
  usuarioId: string;
  fecha: string;
}

export function toInventoryMovement(dto: InventoryMovementDTO): InventoryMovement {
  return {
    id: dto.id,
    tipo: dto.tipo.toLowerCase() as InventoryMovement['tipo'],
    productId: dto.productId,
    rawMaterialId: dto.rawMaterialId,
    cantidad: dto.cantidad,
    ajuste: dto.ajuste,
    motivo: dto.motivo,
    usuarioId: dto.usuarioId,
    fecha: dto.fecha,
  };
}

export interface StockAlertDTO {
  id: string;
  nombre?: string;
  categoria?: string;
  unidadMedida?: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario?: number;
}

export interface StockAlert {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  diferencia: number;
  estado: 'Pendiente' | 'Resuelta' | 'Critico';
  responsable?: string;
  observaciones?: string;
}

export function toStockAlert(dto: StockAlertDTO): StockAlert {
  const diferencia = dto.stockActual - dto.stockMinimo;
  const estado: StockAlert['estado'] = diferencia < 0 ? 'Critico' : 'Pendiente';
  return {
    id: dto.id,
    nombre: dto.nombre ?? 'Sin nombre',
    categoria: dto.categoria ?? 'General',
    unidadMedida: dto.unidadMedida ?? 'Unid',
    stockActual: dto.stockActual,
    stockMinimo: dto.stockMinimo,
    precioUnitario: dto.precioUnitario ?? 0,
    diferencia,
    estado,
  };
}

export interface MovementsListResult {
  data: InventoryMovement[];
  meta: PaginatedResponse<InventoryMovementDTO>['data']['meta'];
}

export interface StockAlertsListResult {
  data: StockAlert[];
  meta: PaginatedResponse<StockAlertDTO>['data']['meta'];
}

export const inventoryApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<MovementsListResult> {
    const response = await api.get<{ items: InventoryMovementDTO[]; meta: PaginatedResponse<InventoryMovementDTO>['data']['meta'] }>('/stock/movements', { query });
    const data = (response?.items ?? []).map(toInventoryMovement);
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { data, meta };
  },

  async create(m: Partial<InventoryMovement> & { usuarioId: string }): Promise<InventoryMovement> {
    const dto = await api.post<InventoryMovementDTO>('/stock/movements', {
      tipo: (m.tipo ?? 'entrada').toUpperCase() as InventoryMovementDTO['tipo'],
      productId: m.productId,
      rawMaterialId: m.rawMaterialId,
      cantidad: m.cantidad,
      ajuste: m.ajuste,
      motivo: m.motivo ?? '',
      usuarioId: m.usuarioId,
    });
    return toInventoryMovement(dto);
  },

  async listAlerts(query?: Record<string, string | number | boolean | undefined | null>): Promise<StockAlertsListResult> {
    const response = await api.get<{ items: StockAlertDTO[]; meta: PaginatedResponse<StockAlertDTO>['data']['meta'] }>('/stock/alerts', { query });
    const data = (response?.items ?? []).map(toStockAlert);
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { data, meta };
  },
};
