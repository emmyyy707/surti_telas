import type { Purchase, PurchaseItem, PurchaseStatus } from '../entities/Purchase';

export interface CreatePurchaseInput {
  numero: string;
  proveedorId: string;
  usuarioId: string;
  total: number;
  observaciones?: string;
  items: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }[];
}

export interface UpdatePurchaseInput {
  observaciones?: string;
  estado?: PurchaseStatus;
}

export interface PurchaseFilters {
  search?: string;
  proveedorId?: string;
  estado?: PurchaseStatus;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'fecha' | 'total' | 'numero';
  order?: 'asc' | 'desc';
}

export interface PurchaseRepository {
  list(filters?: PurchaseFilters): Promise<{ data: Purchase[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Purchase | null>;
  create(input: CreatePurchaseInput): Promise<Purchase>;
  update(id: string, changes: UpdatePurchaseInput): Promise<Purchase>;
  delete(id: string): Promise<void>;
  getItems(purchaseId: string): Promise<PurchaseItem[]>;
  addItem(purchaseId: string, item: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }): Promise<PurchaseItem>;
  removeItem(itemId: string): Promise<void>;
  getProveedorNombre(proveedorId: string): Promise<string>;
  getUsuarioNombre(usuarioId: string): Promise<string>;
}
