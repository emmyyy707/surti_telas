import { api } from './httpClient';
import type { Proveedor } from '@/core/types';
import type { PaginatedResponse } from './pagination';

export interface SupplierDTO {
  id: string;
  nombre: string;
  nit: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  materiales: string[];
  estado: 'ACTIVO' | 'INACTIVO';
  calificacion: number;
  pedidosRealizados: number;
  ultimoPedido?: string;
  createdAt: string;
  updatedAt: string;
}

export function toProveedor(dto: SupplierDTO): Proveedor {
  return {
    id: dto.id,
    nombre: dto.nombre,
    nit: dto.nit,
    telefono: dto.telefono ?? '',
    email: dto.email ?? '',
    direccion: dto.direccion ?? '',
    ciudad: dto.ciudad ?? '',
    materiales: dto.materiales ?? [],
    estado: dto.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    calificacion: dto.calificacion,
    pedidosRealizados: dto.pedidosRealizados,
    ultimoPedido: dto.ultimoPedido,
  };
}

function toSupplierBody(p: Partial<Proveedor>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (p.nombre !== undefined) body.nombre = p.nombre;
  if (p.nit !== undefined) body.nit = p.nit;
  if (p.telefono !== undefined) body.telefono = p.telefono;
  if (p.email !== undefined) body.email = p.email;
  if (p.direccion !== undefined) body.direccion = p.direccion;
  if (p.ciudad !== undefined) body.ciudad = p.ciudad;
  if (p.materiales !== undefined) body.materiales = p.materiales;
  if (p.estado !== undefined) body.estado = p.estado === 'Inactivo' ? 'INACTIVO' : 'ACTIVO';
  if (p.calificacion !== undefined) body.calificacion = p.calificacion;
  return body;
}

export interface SuppliersListResult {
  data: Proveedor[];
  meta: PaginatedResponse<SupplierDTO>['data']['meta'];
}

export const suppliersApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<SuppliersListResult> {
    const response = await api.get<{ items: SupplierDTO[]; meta: PaginatedResponse<SupplierDTO>['data']['meta'] }>('/stock/suppliers', { query });
    const data = (response?.items ?? []).map(toProveedor);
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { data, meta };
  },

  async create(p: Partial<Proveedor>): Promise<Proveedor> {
    const dto = await api.post<SupplierDTO>('/stock/suppliers', toSupplierBody(p));
    return toProveedor(dto);
  },

  async update(id: string, changes: Partial<Proveedor>): Promise<Proveedor> {
    const dto = await api.patch<SupplierDTO>(
      `/stock/suppliers/${encodeURIComponent(id)}`,
      toSupplierBody(changes),
    );
    return toProveedor(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete<null>(`/stock/suppliers/${encodeURIComponent(id)}`);
  },
};
