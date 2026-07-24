export type ControlPrendaEtapa = 'CORTE' | 'CONFECCION' | 'ACABADO' | 'CONTROL_CALIDAD' | 'EMPAQUE';
export type ControlPrendaEstado = 'PROCESO' | 'APROBADO' | 'RECHAZADO';

export interface ControlPrendaData {
  id?: string;
  produccionId: string;
  etapa: ControlPrendaEtapa;
  estado: ControlPrendaEstado;
  cantidadTotal: number;
  cantidadRevisada: number;
  cantidadAprobada: number;
  cantidadRechazada: number;
  observaciones?: string;
  revisadoPorId?: string;
  creadoPorId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ControlPrenda {
  readonly id?: string;
  readonly produccionId: string;
  readonly etapa: ControlPrendaEtapa;
  readonly estado: ControlPrendaEstado;
  readonly cantidadTotal: number;
  readonly cantidadRevisada: number;
  readonly cantidadAprobada: number;
  readonly cantidadRechazada: number;
  readonly observaciones?: string;
  readonly revisadoPorId?: string;
  readonly creadoPorId: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;

  constructor(data: ControlPrendaData) {
    ControlPrenda.validate(data);
    this.id = data.id;
    this.produccionId = data.produccionId;
    this.etapa = data.etapa;
    this.estado = data.estado;
    this.cantidadTotal = data.cantidadTotal;
    this.cantidadRevisada = data.cantidadRevisada;
    this.cantidadAprobada = data.cantidadAprobada;
    this.cantidadRechazada = data.cantidadRechazada;
    this.observaciones = data.observaciones;
    this.revisadoPorId = data.revisadoPorId;
    this.creadoPorId = data.creadoPorId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static validate(data: ControlPrendaData): void {
    if (!data.produccionId) throw new Error('La producción es obligatoria');
    if (data.cantidadTotal <= 0) throw new Error('La cantidad total debe ser mayor a cero');
    if (data.cantidadRevisada < 0) throw new Error('La cantidad revisada no puede ser negativa');
    if (data.cantidadAprobada < 0) throw new Error('La cantidad aprobada no puede ser negativa');
    if (data.cantidadRechazada < 0) throw new Error('La cantidad rechazada no puede ser negativa');
    if (data.cantidadRevisada > data.cantidadTotal) throw new Error('La cantidad revisada no puede exceder la cantidad total');
    if (data.cantidadAprobada + data.cantidadRechazada > data.cantidadRevisada) throw new Error('La suma de aprobadas y rechazadas no puede exceder la cantidad revisada');
    if (!data.creadoPorId) throw new Error('El usuario creador es obligatorio');
  }

  puedeAprobar(): boolean {
    return this.estado !== 'APROBADO';
  }

  puedeRechazar(): boolean {
    return this.estado !== 'RECHAZADO';
  }
}
