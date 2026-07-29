import { api } from './httpClient';

export interface ControlPrendaDTO {
  id: string;
  produccionId: string;
  produccion?: {
    id: string;
    referencia: string;
    cantidad: number;
    pedido?: {
      numero: string;
      clienteNombre: string;
    } | null;
  };
  etapa: 'CORTE' | 'CONFECCION' | 'ACABADO' | 'CONTROL_CALIDAD' | 'EMPAQUE';
  estado: 'PROCESO' | 'APROBADO' | 'RECHAZADO';
  cantidadTotal: number;
  cantidadRevisada: number;
  cantidadAprobada: number;
  cantidadRechazada: number;
  observaciones?: string;
  revisadoPor?: { id: string; nombre: string } | null;
  creadoPor: { id: string; nombre: string };
  createdAt: string;
  updatedAt: string;
}

export interface ControlPrenda {
  id: string;
  produccionId: string;
  produccionNumero?: string;
  produccionCliente?: string;
  etapa: 'Corte' | 'Confección' | 'Acabado' | 'Control de Calidad' | 'Empaque';
  estado: 'Proceso' | 'Aprobado' | 'Rechazado';
  cantidadTotal: number;
  cantidadRevisada: number;
  cantidadAprobada: number;
  cantidadRechazada: number;
  observaciones?: string;
  revisadoPor?: { id: string; nombre: string } | null;
  creadoPor: { id: string; nombre: string };
  createdAt: string;
  updatedAt: string;
}

const ETAPA_TO_DB: Record<string, 'CORTE' | 'CONFECCION' | 'ACABADO' | 'CONTROL_CALIDAD' | 'EMPAQUE'> = {
  Corte: 'CORTE',
  Confección: 'CONFECCION',
  Acabado: 'ACABADO',
  'Control de Calidad': 'CONTROL_CALIDAD',
  Empaque: 'EMPAQUE',
};

const DB_TO_ETAPA: Record<string, ControlPrenda['etapa']> = {
  CORTE: 'Corte',
  CONFECCION: 'Confección',
  ACABADO: 'Acabado',
  CONTROL_CALIDAD: 'Control de Calidad',
  EMPAQUE: 'Empaque',
};

export function toControlPrenda(dto: ControlPrendaDTO): ControlPrenda {
  return {
    id: dto.id,
    produccionId: dto.produccionId,
    produccionNumero: dto.produccion?.pedido?.numero,
    produccionCliente: dto.produccion?.pedido?.clienteNombre,
    etapa: DB_TO_ETAPA[dto.etapa] ?? dto.etapa,
    estado: dto.estado === 'PROCESO' ? 'Proceso' : dto.estado === 'APROBADO' ? 'Aprobado' : 'Rechazado',
    cantidadTotal: dto.cantidadTotal,
    cantidadRevisada: dto.cantidadRevisada,
    cantidadAprobada: dto.cantidadAprobada,
    cantidadRechazada: dto.cantidadRechazada,
    observaciones: dto.observaciones,
    revisadoPor: dto.revisadoPor,
    creadoPor: dto.creadoPor,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const controlPrendaApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<ControlPrenda[]> {
    const response = await api.get<{ items: ControlPrendaDTO[]; meta: Record<string, unknown> }>('/production/control', { query });
    const data = response?.items ?? [];
    return data.map(toControlPrenda);
  },

  async create(data: Partial<ControlPrenda>): Promise<ControlPrenda> {
    const body: Record<string, unknown> = {
      produccionId: data.produccionId,
      etapa: ETAPA_TO_DB[data.etapa ?? ''],
      cantidadTotal: data.cantidadTotal,
      observaciones: data.observaciones,
    };
    const dto = await api.post<ControlPrendaDTO>('/production/control', body);
    return toControlPrenda(dto);
  },

  async getById(id: string): Promise<ControlPrenda | null> {
    try {
      const dto = await api.get<ControlPrendaDTO>(`/production/control/${encodeURIComponent(id)}`);
      return dto ? toControlPrenda(dto) : null;
    } catch {
      return null;
    }
  },

  async review(id: string, estado: 'Aprobado' | 'Rechazado', cantidadAprobada?: number, cantidadRechazada?: number): Promise<ControlPrenda> {
    const dto = await api.patch<ControlPrendaDTO>(`/production/control/${encodeURIComponent(id)}/review`, {
      estado: estado === 'Aprobado' ? 'APROBADO' : 'RECHAZADO',
      cantidadAprobada,
      cantidadRechazada,
    });
    return toControlPrenda(dto);
  },

  async update(id: string, changes: Partial<ControlPrenda>): Promise<ControlPrenda> {
    const body: Record<string, unknown> = {};
    if (changes.etapa !== undefined) body.etapa = ETAPA_TO_DB[changes.etapa];
    if (changes.cantidadTotal !== undefined) body.cantidadTotal = changes.cantidadTotal;
    if (changes.cantidadRevisada !== undefined) body.cantidadRevisada = changes.cantidadRevisada;
    if (changes.cantidadAprobada !== undefined) body.cantidadAprobada = changes.cantidadAprobada;
    if (changes.cantidadRechazada !== undefined) body.cantidadRechazada = changes.cantidadRechazada;
    if (changes.observaciones !== undefined) body.observaciones = changes.observaciones;
    const dto = await api.patch<ControlPrendaDTO>(`/production/control/${encodeURIComponent(id)}`, body);
    return toControlPrenda(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/production/control/${encodeURIComponent(id)}`);
  },
};
