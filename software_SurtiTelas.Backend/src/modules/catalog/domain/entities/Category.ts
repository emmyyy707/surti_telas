export interface CategoryData {
  id?: string;
  nombre: string;
  slug: string;
  parentId?: string | null;
}

export class Category {
  readonly id?: string;
  readonly nombre: string;
  readonly slug: string;
  readonly parentId?: string | null;

  constructor(data: CategoryData) {
    if (data.nombre.trim() === '') throw new Error('La categoría debe tener un nombre');
    if (data.slug.trim() === '') throw new Error('La categoría debe tener un slug');
    this.id = data.id;
    this.nombre = data.nombre;
    this.slug = data.slug;
    this.parentId = data.parentId;
  }
}
