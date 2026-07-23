import { api } from './httpClient';

export type ContactEstado = 'Nuevo' | 'Respondido' | 'Cerrado';
export type ContactPrioridad = 'Baja' | 'Media' | 'Alta';

export interface ContactMessageDTO {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado: ContactEstado;
  prioridad: ContactPrioridad;
  respondidoPor?: string;
  respuesta?: string;
  respondidoEn?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado: ContactEstado;
  prioridad: ContactPrioridad;
  respondidoPor?: string;
  respuesta?: string;
  respondidoEn?: string;
  createdAt: string;
}

export function toContactMessage(dto: ContactMessageDTO): ContactMessage {
  return {
    id: dto.id,
    nombre: dto.nombre,
    email: dto.email,
    telefono: dto.telefono,
    asunto: dto.asunto,
    mensaje: dto.mensaje,
    estado: dto.estado,
    prioridad: dto.prioridad,
    respondidoPor: dto.respondidoPor,
    respuesta: dto.respuesta,
    respondidoEn: dto.respondidoEn,
    createdAt: dto.createdAt,
  };
}

export const contactApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<ContactMessage[]> {
    const response = await api.get<{ data: { items: ContactMessageDTO[]; meta: Record<string, unknown> } }>('/contact', { query });
    const data = response?.data?.items ?? [];
    return data.map(toContactMessage);
  },

  async reply(id: string, respuesta: string): Promise<ContactMessage> {
    const dto = await api.post<ContactMessageDTO>(`/contact/${encodeURIComponent(id)}/reply`, { respuesta });
    return toContactMessage(dto);
  },

  async close(id: string): Promise<ContactMessage> {
    const dto = await api.patch<ContactMessageDTO>(`/contact/${encodeURIComponent(id)}/status`, { estado: 'CERRADO' });
    return toContactMessage(dto);
  },
};
