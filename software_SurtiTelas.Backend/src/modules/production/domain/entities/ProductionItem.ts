export type ProductionItemStatus = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

import { BadRequestError } from '../../../../shared/domain/errors';

export interface ProductionItemData {
  id?: string;
  produccionId: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad?: string;
  precioUnitario?: number;
  estado?: ProductionItemStatus;
}

export class ProductionItem {
  readonly id?: string;
  readonly produccionId: string;
  readonly nombre: string;
  readonly descripcion?: string;
  readonly cantidad: number;
  readonly unidad?: string;
  readonly precioUnitario?: number;

  constructor(data: ProductionItemData) {
    ProductionItem.validate(data);
    this.id = data.id;
    this.produccionId = data.produccionId;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.cantidad = data.cantidad;
    this.unidad = data.unidad;
    this.precioUnitario = data.precioUnitario;
  }

  static validate(data: ProductionItemData): void {
    if (!data.produccionId.trim()) throw new BadRequestError('El item debe pertenecer a una orden de producción');
    if (!data.nombre.trim()) throw new BadRequestError('El item debe tener un nombre');
    if (data.cantidad <= 0) throw new BadRequestError('La cantidad debe ser mayor a cero');
  }

  total(): number {
    return (this.precioUnitario ?? 0) * this.cantidad;
  }
}
