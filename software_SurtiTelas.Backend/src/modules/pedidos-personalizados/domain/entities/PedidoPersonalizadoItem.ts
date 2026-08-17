import { PedidoPersonalizadoItemData } from './PedidoPersonalizadoItemData';

export class PedidoPersonalizadoItem {
  readonly id?: string;
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
  distribucionTallas?: Record<string, number> | null;
  imagenesReferencia?: string[] | null;
  orden: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: PedidoPersonalizadoItemData) {
    this.id = data.id;
    this.pedidoPersonalizadoId = data.pedidoPersonalizadoId;
    this.productoId = data.productoId ?? null;
    this.productoNombre = data.productoNombre ?? null;
    this.descripcion = data.descripcion;
    this.tipoPersonalizacion = data.tipoPersonalizacion;
    this.especificaciones = data.especificaciones ?? null;
    this.cantidad = data.cantidad;
    this.talla = data.talla ?? null;
    this.color = data.color ?? null;
    this.material = data.material ?? null;
    this.ubicacion = data.ubicacion ?? null;
    this.distribucionTallas = data.distribucionTallas ?? null;
    this.imagenesReferencia = data.imagenesReferencia ?? null;
    this.orden = data.orden ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toDTO() {
    return {
      id: this.id,
      pedidoPersonalizadoId: this.pedidoPersonalizadoId,
      productoId: this.productoId,
      productoNombre: this.productoNombre,
      descripcion: this.descripcion,
      tipoPersonalizacion: this.tipoPersonalizacion,
      especificaciones: this.especificaciones,
      cantidad: this.cantidad,
      talla: this.talla,
      color: this.color,
      material: this.material,
      ubicacion: this.ubicacion,
      distribucionTallas: this.distribucionTallas,
      imagenesReferencia: this.imagenesReferencia,
      orden: this.orden,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
