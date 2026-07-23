export interface CmsPageData {
  id?: string;
  slug: string;
  titulo: string;
  contenido?: string;
  publicado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class CmsPage {
  readonly id?: string;
  readonly slug: string;
  readonly titulo: string;
  readonly contenido?: string;
  readonly publicado?: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;

  constructor(data: CmsPageData) {
    CmsPage.validate(data);
    this.id = data.id;
    this.slug = data.slug;
    this.titulo = data.titulo;
    this.contenido = data.contenido;
    this.publicado = data.publicado;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static validate(data: CmsPageData): void {
    if (!data.slug.trim()) {
      throw new Error('El slug es obligatorio');
    }
    if (!data.titulo.trim()) {
      throw new Error('El título es obligatorio');
    }
  }
}
