export interface RawMaterialCategoryData {
  id?: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  estado: string;
}

import { BadRequestError } from '../../../../shared/domain/errors';

export class RawMaterialCategory {
  readonly id?: string;
  readonly nombre: string;
  readonly slug: string;
  readonly descripcion?: string;
  readonly estado: string;

  constructor(data: RawMaterialCategoryData) {
    RawMaterialCategory.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.slug = data.slug;
    this.descripcion = data.descripcion;
    this.estado = data.estado;
  }

  static validate(data: RawMaterialCategoryData): void {
    if (!data.nombre.trim()) throw new BadRequestError('El nombre es obligatorio');
    if (!data.slug.trim()) throw new BadRequestError('El slug es obligatorio');
  }

  activate(): RawMaterialCategory {
    if (this.estado === 'ACTIVO') return this;
    return new RawMaterialCategory({ ...this, estado: 'ACTIVO' });
  }

  deactivate(): RawMaterialCategory {
    if (this.estado === 'INACTIVO') return this;
    return new RawMaterialCategory({ ...this, estado: 'INACTIVO' });
  }
}
