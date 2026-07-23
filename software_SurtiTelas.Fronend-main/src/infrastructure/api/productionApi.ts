import { api } from './httpClient';

export interface ProductionOrderDTO {
  id: string;
  pedidoId?: string;
  operarioId?: string;
  tallerId?: string;
  referencia: string;
  cantidad: number;
  fechaInicio: string;
  fechaEstimada: string;
  avance: number;
  estado: 'PENDIENTE' | 'ASIGNADA' | 'EN_PROCESO' | 'TERMINADO';
  tela?: string;
  colores: string[];
  curvaTallas?: Record<string, unknown>;
  notasTecnicas?: string;
  pedidoNumero?: string;
  pedidoCliente?: string;
  pedidoPrioridad?: string;
  pedidoItemNombre?: string;
  pedidoTotal?: number;
  taller?: { id: string; nombre: string; capacidad?: number };
  operario?: { id: string; nombre: string };
}

export interface ProductionOrder {
  id: string;
  pedidoId?: string;
  operarioId?: string;
  tallerId?: string;
  referencia: string;
  cantidad: number;
  fechaInicio: string;
  fechaEstimada: string;
  avance: number;
  estado: 'Pendiente' | 'Asignada' | 'En produccion' | 'Completada';
  tela?: string;
  colores: string[];
  notasTecnicas?: string;
  taller?: { id: string; nombre: string; capacidad?: number };
  operario?: { id: string; nombre: string };
  pedidoNumero?: string;
  pedidoCliente?: string;
  pedidoPrioridad?: string;
  pedidoItemNombre?: string;
  pedidoTotal?: number;
}

export function toProductionOrder(dto: ProductionOrderDTO): ProductionOrder {
  return {
    id: dto.id,
    pedidoId: dto.pedidoId,
    operarioId: dto.operarioId,
    tallerId: dto.tallerId,
    referencia: dto.referencia,
    cantidad: dto.cantidad,
    fechaInicio: dto.fechaInicio,
    fechaEstimada: dto.fechaEstimada,
    avance: dto.avance,
    estado: dto.estado === 'EN_PROCESO' ? 'En produccion' : dto.estado === 'TERMINADO' ? 'Completada' : 'Pendiente',
    tela: dto.tela,
    colores: dto.colores,
    notasTecnicas: dto.notasTecnicas,
    taller: dto.taller,
    operario: dto.operario,
    pedidoNumero: dto.pedidoNumero,
    pedidoCliente: dto.pedidoCliente,
    pedidoPrioridad: dto.pedidoPrioridad,
    pedidoItemNombre: dto.pedidoItemNombre,
    pedidoTotal: dto.pedidoTotal,
  };
}

export const productionApi = {
  async list(): Promise<ProductionOrder[]> {
    const response = await api.get<{ items: ProductionOrderDTO[]; meta: Record<string, unknown> }>('/production/orders');
    const data = response?.items ?? [];
    return data.map(toProductionOrder);
  },

  async create(data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const body: Record<string, unknown> = {
      referencia: data.referencia,
      cantidad: data.cantidad,
      fechaEstimada: data.fechaEstimada,
      avance: data.avance ?? 0,
      estado: data.estado === 'Pendiente' ? 'PENDIENTE' : data.estado === 'Asignada' ? 'PENDIENTE' : data.estado === 'En produccion' ? 'EN_PROCESO' : data.estado === 'Completada' ? 'TERMINADO' : 'PENDIENTE',
      tela: data.tela,
      colores: data.colores ?? [],
      notasTecnicas: data.notasTecnicas,
      tallerId: data.tallerId,
      operarioId: data.operarioId,
    };
    const dto = await api.post<ProductionOrderDTO>('/production/orders', body);
    return toProductionOrder(dto);
  },

  async assignToWorkshop(id: string, tallerId: string): Promise<ProductionOrder> {
    const dto = await api.post<ProductionOrderDTO>(
      `/production/orders/${encodeURIComponent(id)}/workshop`,
      { tallerId },
    );
    return toProductionOrder(dto);
  },

  async update(id: string, changes: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const body: Record<string, unknown> = {};
    if (changes.referencia !== undefined) body.referencia = changes.referencia;
    if (changes.cantidad !== undefined) body.cantidad = changes.cantidad;
    if (changes.fechaEstimada !== undefined) body.fechaEstimada = changes.fechaEstimada;
    if (changes.avance !== undefined) body.avance = changes.avance;
    if (changes.estado !== undefined) body.estado = changes.estado === 'Pendiente' ? 'PENDIENTE' : changes.estado === 'Asignada' ? 'PENDIENTE' : changes.estado === 'En produccion' ? 'EN_PROCESO' : changes.estado === 'Completada' ? 'TERMINADO' : 'PENDIENTE';
    if (changes.tela !== undefined) body.tela = changes.tela;
    if (changes.colores !== undefined) body.colores = changes.colores;
    if (changes.notasTecnicas !== undefined) body.notasTecnicas = changes.notasTecnicas;
    if (changes.tallerId !== undefined) body.tallerId = changes.tallerId;
    if (changes.operarioId !== undefined) body.operarioId = changes.operarioId;
    const dto = await api.patch<ProductionOrderDTO>(`/production/orders/${encodeURIComponent(id)}`, body);
    return toProductionOrder(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/production/orders/${encodeURIComponent(id)}`);
  },
};
