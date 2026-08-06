export type WorkshopStatus = 'ACTIVO' | 'INACTIVO';

import { BadRequestError } from '../../../../shared/domain/errors';

export interface WorkshopData {
  id?: string;
  nombre: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string | null;
  email?: string | null;
  estado: WorkshopStatus;
  capacidad?: number;
  ocupacion?: number;
}

export class Workshop {
  readonly id?: string;
  readonly nombre: string;
  readonly encargadoId?: string;
  readonly direccion?: string;
  readonly ciudad?: string;
  readonly telefono?: string | null;
  readonly email?: string | null;
  readonly estado: WorkshopStatus;
  readonly capacidad?: number;
  readonly ocupacion?: number;

  constructor(data: WorkshopData) {
    Workshop.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.encargadoId = data.encargadoId;
    this.direccion = data.direccion;
    this.ciudad = data.ciudad;
    this.telefono = data.telefono;
    this.email = data.email;
    this.estado = data.estado;
    this.capacidad = data.capacidad;
    this.ocupacion = data.ocupacion;
  }

  static validate(data: WorkshopData): void {
    if (!data.nombre.trim()) throw new BadRequestError('El taller debe tener un nombre');
  }

  activate(): Workshop {
    if (this.estado === 'ACTIVO') return this;
    return new Workshop({ ...this, estado: 'ACTIVO' });
  }

  deactivate(): Workshop {
    if (this.estado === 'INACTIVO') return this;
    return new Workshop({ ...this, estado: 'INACTIVO' });
  }
}

