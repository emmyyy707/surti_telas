import type { RawMaterialData } from '../../domain/entities/RawMaterial';

type RawMaterialRow = {
  id: string;
  nombre: string;
  categoria: string | null;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  proveedorId: string | null;
  precioUnitario: { toNumber(): number };
};

export function toRawMaterialData(row: RawMaterialRow): RawMaterialData {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria ?? undefined,
    unidadMedida: row.unidadMedida,
    stockActual: row.stockActual,
    stockMinimo: row.stockMinimo,
    proveedorId: row.proveedorId ?? undefined,
    precioUnitario: row.precioUnitario.toNumber(),
  };
}
