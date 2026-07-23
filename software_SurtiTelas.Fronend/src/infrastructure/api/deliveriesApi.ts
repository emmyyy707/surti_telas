import { api } from './httpClient';

export interface DeliveryDTO {
  id: string;
  orderId: string;
  customerId?: string;
  domiciliarioId?: string;
  estado: 'ASIGNADO' | 'EN_RUTA' | 'ENTREGADO' | 'FALLIDO';
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  notas?: string;
  asignadoEn?: string;
  entregadoEn?: string;
  createdAt?: string;
  updatedAt?: string;
  orderNumero?: string;
  clienteNombre?: string;
  domiciliarioNombre?: string;
}

export interface Delivery {
  id: string;
  orderId?: string;
  customerId?: string;
  domiciliarioId?: string;
  estado?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  notas?: string;
  asignadoEn?: string;
  entregadoEn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function toDelivery(dto: DeliveryDTO): Delivery {
  return {
    id: dto.id,
    orderId: dto.orderId,
    customerId: dto.customerId,
    domiciliarioId: dto.domiciliarioId,
    estado: dto.estado,
    direccion: dto.direccion,
    ciudad: dto.ciudad,
    telefono: dto.telefono,
    notas: dto.notas,
    asignadoEn: dto.asignadoEn,
    entregadoEn: dto.entregadoEn,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface Domiciliario {
  id: string;
  nombre: string;
  email: string;
  tel: string;
  zona: string;
  entregas: number;
  estado: 'Activo' | 'Inactivo';
}

export function toDomiciliario(dto: DeliveryDTO): Domiciliario {
  const parts = [dto.direccion, dto.ciudad].filter(Boolean);
  return {
    id: dto.domiciliarioId ?? dto.id,
    nombre: dto.clienteNombre ?? dto.customerId ?? dto.domiciliarioNombre ?? 'Desconocido',
    email: '',
    tel: dto.telefono ?? '',
    zona: parts.join(', ') || 'Sin zona',
    entregas: 1,
    estado: dto.estado === 'ENTREGADO' || dto.estado === 'EN_RUTA' ? 'Activo' : 'Inactivo',
  };
}

export function aggregateDomiciliarios(deliveries: DeliveryDTO[]): Domiciliario[] {
  const map = new Map<string, Domiciliario>();

  for (const dto of deliveries) {
    const key = dto.domiciliarioId ?? dto.id;
    const existing = map.get(key);

    if (existing) {
      existing.entregas += 1;
      if (dto.estado === 'EN_RUTA' || dto.estado === 'ENTREGADO') {
        existing.estado = 'Activo';
      }
    } else {
      map.set(key, toDomiciliario(dto));
    }
  }

  return Array.from(map.values());
}

export const deliveriesApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<DeliveryDTO[]> {
    try {
      const response = await api.get<{ items: DeliveryDTO[]; meta: Record<string, unknown> }>('/deliveries', { query });
      return response?.items ?? [];
    } catch {
      return [];
    }
  },

  async updateStatus(id: string, estado: DeliveryDTO['estado']): Promise<DeliveryDTO> {
    const dto = await api.post<DeliveryDTO>(`/deliveries/${encodeURIComponent(id)}/status`, { estado });
    return dto;
  },
};
