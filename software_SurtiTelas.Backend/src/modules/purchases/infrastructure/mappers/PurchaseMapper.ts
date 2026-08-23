import type { PurchaseData, PurchaseItemData, PurchaseStatus } from '../../domain/entities/Purchase';

type PurchaseRow = {
  id: string;
  numero: string;
  proveedorId: string;
  usuarioId: string;
  fecha: Date;
  total: { toNumber(): number };
  estado: string;
  observaciones: string | null;
  motivoCancelacion: string | null;
};

type PurchaseItemRow = {
  id: string;
  purchaseId: string;
  rawMaterialId: string | null;
  nombre: string;
  cantidad: number;
  precioUnitario: { toNumber(): number };
  subtotal: { toNumber(): number };
};

export function toPurchaseData(row: PurchaseRow): PurchaseData {
  return {
    id: row.id,
    numero: row.numero,
    proveedorId: row.proveedorId,
    usuarioId: row.usuarioId,
    fecha: row.fecha,
    total: row.total.toNumber(),
    estado: row.estado as PurchaseStatus,
    observaciones: row.observaciones ?? undefined,
    motivoCancelacion: row.motivoCancelacion ?? undefined,
  };
}

export function toPurchaseItemData(row: PurchaseItemRow): PurchaseItemData {
  return {
    id: row.id,
    purchaseId: row.purchaseId,
    rawMaterialId: row.rawMaterialId ?? undefined,
    nombre: row.nombre,
    cantidad: row.cantidad,
    precioUnitario: row.precioUnitario.toNumber(),
    subtotal: row.subtotal.toNumber(),
  };
}

export const PURCHASE_STATUS_TO_DB: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  RECIBIDA: 'RECIBIDA',
  CANCELADA: 'CANCELADA',
  ANULADA: 'ANULADA',
};

export const DB_TO_PURCHASE_STATUS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  RECIBIDA: 'RECIBIDA',
  CANCELADA: 'CANCELADA',
  ANULADA: 'ANULADA',
};
