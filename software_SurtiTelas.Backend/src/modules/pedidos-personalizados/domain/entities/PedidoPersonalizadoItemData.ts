export interface PedidoPersonalizadoItemData {
  id?: string;
  pedidoPersonalizadoId?: string;
  productoId?: string | null;
  productoNombre?: string | null;
  descripcion: string;
  tipoPersonalizacion: string;
  especificaciones?: string | null;
  cantidad: number;
  talla?: string | null;
  color?: string | null;
  material?: string | null;
  ubicacion?: string[] | null;
  orden?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PersonalizacionItemData {
  id?: string;
  customOrderItemId?: string;
  tipo: string;
  tecnica?: string | null;
  ubicacion?: string[] | null;
  descripcion: string;
  archivos?: string[] | null;
  orden?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PersonalizacionItem {
  readonly id?: string;
  customOrderItemId?: string;
  tipo: string;
  tecnica?: string | null;
  ubicacion?: string[] | null;
  descripcion: string;
  archivos: string[];
  orden: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: PersonalizacionItemData) {
    this.id = data.id;
    this.customOrderItemId = data.customOrderItemId;
    this.tipo = data.tipo;
    this.tecnica = data.tecnica ?? null;
    this.ubicacion = data.ubicacion ?? null;
    this.descripcion = data.descripcion;
    this.archivos = data.archivos ?? [];
    this.orden = data.orden ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toDTO() {
    return {
      id: this.id,
      customOrderItemId: this.customOrderItemId,
      tipo: this.tipo,
      tecnica: this.tecnica,
      ubicacion: this.ubicacion,
      descripcion: this.descripcion,
      archivos: this.archivos,
      orden: this.orden,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface VarianteData {
  id?: string;
  customOrderPersonalizationId?: string;
  talla: string;
  color: string;
  cantidad: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Variante {
  readonly id?: string;
  customOrderPersonalizationId?: string;
  talla: string;
  color: string;
  cantidad: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: VarianteData) {
    this.id = data.id;
    this.customOrderPersonalizationId = data.customOrderPersonalizationId;
    this.talla = data.talla;
    this.color = data.color;
    this.cantidad = data.cantidad;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toDTO() {
    return {
      id: this.id,
      customOrderPersonalizationId: this.customOrderPersonalizationId,
      talla: this.talla,
      color: this.color,
      cantidad: this.cantidad,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
