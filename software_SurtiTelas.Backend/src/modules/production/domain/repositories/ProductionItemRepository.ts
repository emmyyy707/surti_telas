import type { ProductionItem, ProductionItemStatus } from '../entities/ProductionItem';

export interface CreateProductionItemInput {
  produccionId: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad?: string;
  precioUnitario?: number;
  estado?: ProductionItemStatus;
}

export interface UpdateProductionItemInput {
  nombre?: string;
  descripcion?: string;
  cantidad?: number;
  unidad?: string;
  precioUnitario?: number;
  estado?: ProductionItemStatus;
}

export interface ProductionItemFilters {
  produccionId?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'nombre' | 'cantidad' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface ProductionItemRepository {
  list(filters?: ProductionItemFilters): Promise<{ data: ProductionItem[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<ProductionItem | null>;
  create(input: CreateProductionItemInput): Promise<ProductionItem>;
  update(id: string, changes: UpdateProductionItemInput): Promise<ProductionItem>;
  delete(id: string): Promise<void>;
}
