import type { RawMaterialCategoryData } from '../../domain/entities/RawMaterialCategory';

type RawMaterialCategoryRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  estado: string;
};

export function toRawMaterialCategoryData(row: RawMaterialCategoryRow): RawMaterialCategoryData {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion ?? undefined,
    estado: row.estado,
  };
}
