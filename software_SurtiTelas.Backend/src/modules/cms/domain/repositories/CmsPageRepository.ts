import type { CmsPage } from '../entities/CmsPage';

export interface CreateCmsInput {
  slug: string;
  titulo: string;
  contenido?: string;
  publicado?: boolean;
}

export interface UpdateCmsInput {
  slug?: string;
  titulo?: string;
  contenido?: string;
  publicado?: boolean;
}

export interface CmsFilters {
  slug?: string;
}

export interface CmsPageRepository {
  list(filters: CmsFilters): Promise<CmsPage[]>;
  getById(id: string): Promise<CmsPage | null>;
  getBySlug(slug: string): Promise<CmsPage | null>;
  create(input: CreateCmsInput): Promise<CmsPage>;
  update(id: string, changes: UpdateCmsInput): Promise<CmsPage>;
}
