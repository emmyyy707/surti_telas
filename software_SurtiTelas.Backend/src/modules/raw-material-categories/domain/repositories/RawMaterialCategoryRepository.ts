import type { RawMaterialCategory } from '../entities/RawMaterialCategory';

export interface CreateRawMaterialCategoryInput {
  nombre: string;
  slug: string;
  descripcion?: string;
  estado?: string;
}

export interface UpdateRawMaterialCategoryInput {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  estado?: string;
}

export interface RawMaterialCategoryFilters {
  search?: string;
  estado?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'nombre' | 'slug';
  order?: 'asc' | 'desc';
}

export interface RawMaterialCategoryRepository {
  list(filters?: RawMaterialCategoryFilters): Promise<{ data: RawMaterialCategory[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<RawMaterialCategory | null>;
  create(input: CreateRawMaterialCategoryInput): Promise<RawMaterialCategory>;
  update(id: string, changes: UpdateRawMaterialCategoryInput): Promise<RawMaterialCategory>;
  delete(id: string): Promise<void>;
}
