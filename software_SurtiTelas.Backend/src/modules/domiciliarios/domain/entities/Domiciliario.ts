import { BadRequestError } from '../../../../shared/domain/errors';

export type DomiciliarioEstado = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';

export interface DomiciliarioData {
  id?: string;
  userId: string;
  zona?: string;
  vehiculo?: string;
  capacidad?: number;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Domiciliario {
  readonly id?: string;
  readonly userId: string;
  readonly zona?: string;
  readonly vehiculo?: string;
  readonly capacidad?: number;
  readonly activo: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: DomiciliarioData) {
    Domiciliario.validate(data);
    this.id = data.id;
    this.userId = data.userId;
    this.zona = data.zona;
    this.vehiculo = data.vehiculo;
    this.capacidad = data.capacidad;
    this.activo = data.activo ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data: DomiciliarioData): void {
    if (!data.userId.trim()) {
      throw new BadRequestError('El usuario es obligatorio');
    }
  }
}
