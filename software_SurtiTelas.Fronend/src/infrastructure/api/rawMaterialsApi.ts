import { api } from './httpClient';

export interface RawMaterialDTO {
  id: string;
  nombre: string;
  categoria?: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  proveedorId?: string;
  precioUnitario: number;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial {
  id: string;
  nombre: string;
  categoria?: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  proveedorId?: string;
  precioUnitario: number;
}

export function toRawMaterial(dto: RawMaterialDTO): RawMaterial {
  return {
    id: dto.id,
    nombre: dto.nombre,
    categoria: dto.categoria,
    unidadMedida: dto.unidadMedida,
    stockActual: dto.stockActual,
    stockMinimo: dto.stockMinimo,
    proveedorId: dto.proveedorId,
    precioUnitario: dto.precioUnitario,
  };
}

function toRawMaterialBody(m: Partial<RawMaterial>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (m.nombre !== undefined) body.nombre = m.nombre;
  if (m.categoria !== undefined) body.categoria = m.categoria;
  if (m.unidadMedida !== undefined) body.unidadMedida = m.unidadMedida;
  if (m.stockActual !== undefined) body.stockActual = m.stockActual;
  if (m.stockMinimo !== undefined) body.stockMinimo = m.stockMinimo;
  if (m.proveedorId !== undefined) body.proveedorId = m.proveedorId;
  if (m.precioUnitario !== undefined) body.precioUnitario = m.precioUnitario;
  return body;
}

export const rawMaterialsApi = {
  async list(): Promise<RawMaterial[]> {
    const response = await api.get<{ items: RawMaterialDTO[]; meta: Record<string, unknown> }>('/stock/raw-materials');
    const data = response?.items ?? [];
    return data.map(toRawMaterial);
  },

  async create(m: Partial<RawMaterial>): Promise<RawMaterial> {
    const dto = await api.post<RawMaterialDTO>('/stock/raw-materials', toRawMaterialBody(m));
    return toRawMaterial(dto);
  },

  async update(id: string, changes: Partial<RawMaterial>): Promise<RawMaterial> {
    const dto = await api.patch<RawMaterialDTO>(
      `/stock/raw-materials/${encodeURIComponent(id)}`,
      toRawMaterialBody(changes),
    );
    return toRawMaterial(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/stock/raw-materials/${encodeURIComponent(id)}`);
  },
};
