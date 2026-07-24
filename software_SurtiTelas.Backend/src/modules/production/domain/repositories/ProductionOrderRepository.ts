import type { ProductionOrder, ProductionStatus } from '../entities/ProductionOrder';

export interface CreateProductionOrderInput {
  pedidoId?: string;
  operarioId?: string;
  tallerId?: string;
  referencia: string;
  cantidad: number;
  fechaInicio?: Date;
  fechaEstimada: Date;
  avance?: number;
  estado?: ProductionStatus;
  tela?: string;
  colores?: string[];
  curvaTallas?: Record<string, number>;
  notasTecnicas?: string;
}

export interface UpdateProductionOrderInput {
  operarioId?: string;
  tallerId?: string;
  referencia?: string;
  cantidad?: number;
  fechaEstimada?: Date | string;
  avance?: number;
  estado?: ProductionStatus;
  tela?: string;
  colores?: string[];
  curvaTallas?: Record<string, number>;
  notasTecnicas?: string;
}

export interface ProductionOrderFilters {
  estado?: ProductionStatus;
  tallerId?: string;
  operarioId?: string;
  pedidoId?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'fechaInicio' | 'avance' | 'estado';
  order?: 'asc' | 'desc';
}

export interface ProductionOrderRepository {
  list(filters?: ProductionOrderFilters): Promise<{ data: ProductionOrder[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<ProductionOrder | null>;
  create(input: CreateProductionOrderInput): Promise<ProductionOrder>;
  update(id: string, changes: UpdateProductionOrderInput): Promise<ProductionOrder>;
  assignToWorkshop(id: string, tallerId: string): Promise<ProductionOrder>;
  updateProgress(id: string, avance: number): Promise<ProductionOrder>;
  complete(id: string): Promise<ProductionOrder>;
  delete(id: string): Promise<void>;
}
