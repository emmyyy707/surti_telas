import type { InventoryMovement, StockMovementType } from '../entities/InventoryMovement';

export interface CreateMovementInput {
  tipo: StockMovementType;
  productId?: string;
  rawMaterialId?: string;
  cantidad: number;
  ajuste?: number;
  motivo: string;
  usuarioId: string;
}

export interface MovementFilters {
  tipo?: StockMovementType;
  productId?: string;
  rawMaterialId?: string;
  usuarioId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'fecha' | 'cantidad' | 'tipo';
  order?: 'asc' | 'desc';
}

export interface InventoryMovementRepository {
  list(filters?: MovementFilters): Promise<{ data: InventoryMovement[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<InventoryMovement | null>;
  create(input: CreateMovementInput): Promise<InventoryMovement>;
  delete(id: string): Promise<void>;
}
