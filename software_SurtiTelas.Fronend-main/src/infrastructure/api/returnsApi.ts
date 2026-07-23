import { api } from './httpClient';

export type DevolucionEstado =
  | 'RECIBIDO'
  | 'EN_INSPECCION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'EN_REPARACION'
  | 'REINGRESADO'
  | 'DESCARTADO';

export type DevolucionDestino =
  | 'REINGRESO_INVENTARIO'
  | 'REPARACION'
  | 'DESCARTE'
  | 'DEVOLUCION_PROVEEDOR';

export interface ReturnDTO {
  id: string;
  numeroDevolucion?: string;
  numeroOrden?: string;
  prenda?: string;
  referencia?: string;
  motivo?: string;
  cantidad?: number;
  cantidadInspeccionada?: number;
  fechaDevolucion?: string;
  estado?: DevolucionEstado;
  destino?: DevolucionDestino;
  cliente?: string;
  responsable?: string;
  observaciones?: string;
}

export interface Return {
  id: string;
  numeroDevolucion: string;
  numeroOrden: string;
  prenda: string;
  referencia: string;
  motivo: string;
  cantidad: number;
  cantidadInspeccionada: number;
  fechaDevolucion: string;
  estado: DevolucionEstado;
  destino: DevolucionDestino;
  cliente: string;
  responsable?: string;
  observaciones: string;
}

export function toReturn(dto: ReturnDTO): Return {
  return {
    id: dto.id,
    numeroDevolucion: dto.numeroDevolucion ?? dto.id,
    numeroOrden: dto.numeroOrden ?? '',
    prenda: dto.prenda ?? 'Sin especificar',
    referencia: dto.referencia ?? '',
    motivo: dto.motivo ?? '',
    cantidad: Number(dto.cantidad) || 0,
    cantidadInspeccionada: Number(dto.cantidadInspeccionada) || 0,
    fechaDevolucion: dto.fechaDevolucion ?? new Date().toISOString().slice(0, 10),
    estado: dto.estado ?? 'RECIBIDO',
    destino: dto.destino ?? 'REINGRESO_INVENTARIO',
    cliente: dto.cliente ?? '',
    responsable: dto.responsable,
    observaciones: dto.observaciones ?? '',
  };
}

export interface CreateReturnInput {
  numeroOrden: string;
  prenda: string;
  referencia?: string;
  motivo?: string;
  cantidad: number;
  cantidadInspeccionada?: number;
  destino?: DevolucionDestino;
  cliente: string;
  responsable?: string;
  observaciones?: string;
  fechaDevolucion?: string;
}

export const returnsApi = {
  async list(): Promise<Return[]> {
    const response = await api.get<{ items: ReturnDTO[]; meta: Record<string, unknown> }>('/returns');
    const data = response?.items ?? [];
    return data.map(toReturn);
  },

  async getById(id: string): Promise<Return | null> {
    try {
      const dto = await api.get<ReturnDTO>(`/returns/${encodeURIComponent(id)}`);
      return dto ? toReturn(dto) : null;
    } catch {
      return null;
    }
  },

  async create(input: CreateReturnInput): Promise<Return> {
    const dto = await api.post<ReturnDTO>('/returns', {
      orderId: input.numeroOrden,
      prenda: input.prenda,
      referencia: input.referencia,
      motivo: input.motivo,
      cantidad: input.cantidad,
      cantidadInspeccionada: input.cantidadInspeccionada,
      destino: input.destino,
      cliente: input.cliente,
      responsable: input.responsable,
      observaciones: input.observaciones,
      fechaDevolucion: input.fechaDevolucion,
    });
    return toReturn(dto);
  },

  async update(
    id: string,
    changes: Partial<Omit<CreateReturnInput, 'numeroOrden'>>,
  ): Promise<Return> {
    const dto = await api.patch<ReturnDTO>(`/returns/${encodeURIComponent(id)}`, changes);
    return toReturn(dto);
  },

  async changeStatus(id: string, estado: DevolucionEstado): Promise<Return> {
    const dto = await api.post<ReturnDTO>(`/returns/${encodeURIComponent(id)}/status`, { estado });
    return toReturn(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/returns/${encodeURIComponent(id)}`);
  },
};

export default returnsApi;
