export type PurchaseStatus = 'PENDIENTE' | 'RECIBIDA' | 'CANCELADA' | 'ANULADA';

export interface PurchaseData {
  id?: string;
  numero: string;
  proveedorId: string;
  usuarioId: string;
  fecha?: Date;
  total: number;
  estado: PurchaseStatus;
  observaciones?: string;
  motivoCancelacion?: string;
}

export interface PurchaseItemData {
  id?: string;
  purchaseId?: string;
  rawMaterialId?: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

import { BadRequestError } from '../../../../shared/domain/errors';

export class Purchase {
  readonly id?: string;
  readonly numero: string;
  readonly proveedorId: string;
  readonly usuarioId: string;
  readonly fecha: Date;
  readonly total: number;
  readonly estado: PurchaseStatus;
  readonly observaciones?: string;
  readonly motivoCancelacion?: string;

  constructor(data: PurchaseData) {
    Purchase.validate(data);
    this.id = data.id;
    this.numero = data.numero;
    this.proveedorId = data.proveedorId;
    this.usuarioId = data.usuarioId;
    this.fecha = data.fecha ?? new Date();
    this.total = data.total;
    this.estado = data.estado;
    this.observaciones = data.observaciones;
    this.motivoCancelacion = data.motivoCancelacion;
  }

  static validate(data: PurchaseData): void {
    if (!data.numero.trim()) throw new BadRequestError('El número de compra es obligatorio');
    if (!data.proveedorId.trim()) throw new BadRequestError('El proveedor es obligatorio');
    if (!data.usuarioId.trim()) throw new BadRequestError('El usuario es obligatorio');
    if (data.total < 0) throw new BadRequestError('El total no puede ser negativo');
  }

  cancel(motivo: string): Purchase {
    if (this.estado === 'CANCELADA' || this.estado === 'ANULADA') {
      return this;
    }
    if (!motivo.trim()) throw new BadRequestError('El motivo de cancelación es obligatorio');
    return new Purchase({ ...this, estado: 'ANULADA', motivoCancelacion: motivo });
  }

  markReceived(): Purchase {
    if (this.estado === 'RECIBIDA') return this;
    return new Purchase({ ...this, estado: 'RECIBIDA' });
  }
}

export class PurchaseItem {
  readonly id?: string;
  readonly purchaseId?: string;
  readonly rawMaterialId?: string;
  readonly nombre: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
  readonly subtotal: number;

  constructor(data: PurchaseItemData) {
    PurchaseItem.validate(data);
    this.id = data.id;
    this.purchaseId = data.purchaseId;
    this.rawMaterialId = data.rawMaterialId;
    this.nombre = data.nombre;
    this.cantidad = data.cantidad;
    this.precioUnitario = data.precioUnitario;
    this.subtotal = data.subtotal;
  }

  static validate(data: PurchaseItemData): void {
    if (!data.nombre.trim()) throw new BadRequestError('El nombre del ítem es obligatorio');
    if (data.cantidad <= 0) throw new BadRequestError('La cantidad debe ser mayor a 0');
    if (data.precioUnitario < 0) throw new BadRequestError('El precio unitario no puede ser negativo');
  }
}
