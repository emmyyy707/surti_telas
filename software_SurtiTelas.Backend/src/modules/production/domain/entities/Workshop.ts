export type WorkshopStatus = 'ACTIVO' | 'INACTIVO';

export interface WorkshopData {
  id?: string;
  nombre: string;
  encargadoId?: string;
  direccion?: string;
  ciudad?: string;
  estado: WorkshopStatus;
  capacidad?: number;
}

export class Workshop {
  readonly id?: string;
  readonly nombre: string;
  readonly encargadoId?: string;
  readonly direccion?: string;
  readonly ciudad?: string;
  readonly estado: WorkshopStatus;
  readonly capacidad?: number;

  constructor(data: WorkshopData) {
    Workshop.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.encargadoId = data.encargadoId;
    this.direccion = data.direccion;
    this.ciudad = data.ciudad;
    this.estado = data.estado;
    this.capacidad = data.capacidad;
  }

  static validate(data: WorkshopData): void {
    if (!data.nombre.trim()) throw new Error('El taller debe tener un nombre');
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
