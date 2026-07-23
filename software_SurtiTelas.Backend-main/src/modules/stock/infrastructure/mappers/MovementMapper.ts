import type { InventoryMovementData, StockMovementType } from '../../domain/entities/InventoryMovement';

type MovementRow = {
  id: string;
  tipo: string;
  productId: string | null;
  rawMaterialId: string | null;
  cantidad: number;
  ajuste: number | null;
  motivo: string;
  usuarioId: string;
  fecha: Date;
};

export function toInventoryMovementData(row: MovementRow): InventoryMovementData {
  return {
    id: row.id,
    tipo: row.tipo as StockMovementType,
    productId: row.productId ?? undefined,
    rawMaterialId: row.rawMaterialId ?? undefined,
    cantidad: row.cantidad,
    ajuste: row.ajuste ?? undefined,
    motivo: row.motivo,
    usuarioId: row.usuarioId,
    fecha: row.fecha,
  };
}
