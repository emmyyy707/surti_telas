import { api } from './httpClient';

export interface AlertDTO {
  id: string;
  tipo: string;
  modulo: string;
  referenciaId?: string;
  mensaje: string;
  estado: 'PENDIENTE' | 'LEIDA' | 'RESUELTA' | 'CANCELADA';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  leida: boolean;
  leidaPor?: { id: string; nombre: string } | null;
  resueltaPor?: { id: string; nombre: string } | null;
  resueltaEn?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Alert {
  id: string;
  tipo: string;
  modulo: string;
  referenciaId?: string;
  mensaje: string;
  estado: 'Pendiente' | 'Vista' | 'Resuelta' | 'Cancelada';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Critica';
  leida: boolean;
  leidaPor?: { id: string; nombre: string } | null;
  resueltaPor?: { id: string; nombre: string } | null;
  resueltaEn?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function toAlert(dto: AlertDTO): Alert {
  return {
    id: dto.id,
    tipo: dto.tipo,
    modulo: dto.modulo,
    referenciaId: dto.referenciaId,
    mensaje: dto.mensaje,
    estado: dto.estado === 'PENDIENTE' ? 'Pendiente' : dto.estado === 'LEIDA' ? 'Vista' : dto.estado === 'RESUELTA' ? 'Resuelta' : 'Cancelada',
    prioridad: dto.prioridad === 'BAJA' ? 'Baja' : dto.prioridad === 'MEDIA' ? 'Media' : dto.prioridad === 'ALTA' ? 'Alta' : 'Critica',
    leida: dto.leida,
    leidaPor: dto.leidaPor,
    resueltaPor: dto.resueltaPor,
    resueltaEn: dto.resueltaEn,
    metadata: dto.metadata,
    createdAt: dto.createdAt,
  };
}

export const alertsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Alert[]> {
    const response = await api.get<{ items: AlertDTO[]; meta: Record<string, unknown> }>('/alerts', { query });
    const data = response?.items ?? [];
    return data.map(toAlert);
  },

  async getById(id: string): Promise<Alert | null> {
    try {
      const dto = await api.get<AlertDTO>(`/alerts/${encodeURIComponent(id)}`);
      return dto ? toAlert(dto) : null;
    } catch {
      return null;
    }
  },

  async markAsRead(id: string): Promise<Alert> {
    const dto = await api.patch<AlertDTO>(`/alerts/${encodeURIComponent(id)}/read`, {});
    return toAlert(dto);
  },

  async markAsResolved(id: string): Promise<Alert> {
    const dto = await api.patch<AlertDTO>(`/alerts/${encodeURIComponent(id)}/resolve`, {});
    return toAlert(dto);
  },
};
