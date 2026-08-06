export type StockMovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

import { BadRequestError } from '../../../../shared/domain/errors';

export interface InventoryMovementData {
  id?: string;
  tipo: StockMovementType;
  productId?: string;
  rawMaterialId?: string;
  cantidad: number;
  ajuste?: number;
  motivo: string;
  usuarioId: string;
  fecha?: Date;
}

export class InventoryMovement {
  readonly id?: string;
  readonly tipo: StockMovementType;
  readonly productId?: string;
  readonly rawMaterialId?: string;
  readonly cantidad: number;
  readonly ajuste?: number;
  readonly motivo: string;
  readonly usuarioId: string;
  readonly fecha: Date;

  constructor(data: InventoryMovementData) {
    InventoryMovement.validate(data);
    this.id = data.id;
    this.tipo = data.tipo;
    this.productId = data.productId;
    this.rawMaterialId = data.rawMaterialId;
    this.cantidad = data.cantidad;
    this.ajuste = data.ajuste;
    this.motivo = data.motivo;
    this.usuarioId = data.usuarioId;
    this.fecha = data.fecha ?? new Date();
  }

  static validate(data: InventoryMovementData): void {
    if (!data.motivo.trim()) throw new BadRequestError('El movimiento debe tener un motivo');
    if (!data.cantidad || data.cantidad <= 0) throw new BadRequestError('La cantidad debe ser mayor a cero');
    if (!data.productId && !data.rawMaterialId) {
      throw new BadRequestError('El movimiento debe estar asociado a un producto o insumo');
    }
  }
}

