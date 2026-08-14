export interface PersonalizacionData {
  id?: string;
  pedidoPersonalizadoId?: string;
  tipo: string;
  descripcion: string;
  valorCaracteristica?: string | null;
  restricciones?: string | null;
  costoEstimado?: number | null;
  requiereAprobacion?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Personalizacion {
  readonly id?: string;
  pedidoPersonalizadoId?: string;
  tipo: string;
  descripcion: string;
  valorCaracteristica?: string | null;
  restricciones?: string | null;
  costoEstimado?: number | null;
  requiereAprobacion: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: PersonalizacionData) {
    this.id = data.id;
    this.pedidoPersonalizadoId = data.pedidoPersonalizadoId;
    this.tipo = data.tipo;
    this.descripcion = data.descripcion;
    this.valorCaracteristica = data.valorCaracteristica ?? null;
    this.restricciones = data.restricciones ?? null;
    this.costoEstimado = data.costoEstimado ?? null;
    this.requiereAprobacion = data.requiereAprobacion ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toDTO() {
    return {
      id: this.id,
      pedidoPersonalizadoId: this.pedidoPersonalizadoId,
      tipo: this.tipo,
      descripcion: this.descripcion,
      valorCaracteristica: this.valorCaracteristica,
      restricciones: this.restricciones,
      costoEstimado: this.costoEstimado,
      requiereAprobacion: this.requiereAprobacion,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
