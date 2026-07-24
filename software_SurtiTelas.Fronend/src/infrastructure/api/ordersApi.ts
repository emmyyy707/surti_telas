import type { Pedido, PedidoItem } from '@/core/types';
import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

/** DTO del backend (OrderMapper.toOrderData). */
export interface OrderDTO {
  id: string;
  numero: string;
  cliente: string;
  asesor: string;
  fecha: string;
  items: number;
  total: number;
  estado: Pedido['estado'];
  prioridad?: Pedido['prioridad'];
  observaciones?: string;
  itemsList?: PedidoItem[];
  clienteId: string;
  asesorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  clienteId: string;
  asesorId?: string;
  itemsList: PedidoItem[];
  prioridad?: Pedido['prioridad'];
  observaciones?: string;
  comprobantePago?: File;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';
  installments?: number;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const fmt = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
  return fmt.replace(/\b([a-záéíóú])/g, (m) => m.toUpperCase());
}

export interface OrdersListResult {
  pedidos: Pedido[];
  idByNumero: Record<string, string>;
  meta: PaginatedResponse<OrderDTO>['data']['meta'];
}

export function toPedido(dto: OrderDTO): Pedido {
  return {
    id: dto.id,
    numero: dto.numero,
    cliente: dto.cliente,
    asesor: dto.asesor,
    fecha: formatDate(dto.fecha),
    items: dto.items,
    total: formatCurrency(dto.total),
    estado: dto.estado,
    prioridad: dto.prioridad,
    observaciones: dto.observaciones,
    itemsList: dto.itemsList ?? [],
    clienteId: dto.clienteId,
    asesorId: dto.asesorId,
  };
}

export const ordersApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<OrdersListResult> {
    const response = await api.get<{ items: OrderDTO[]; meta: PaginatedResponse<OrderDTO>['data']['meta'] }>('/orders', { query });
    const data = response?.items ?? [];
    const idByNumero: Record<string, string> = {};
    const pedidos = data.map((dto) => {
      idByNumero[dto.numero] = dto.id;
      return toPedido(dto);
    });
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { pedidos, idByNumero, meta };
  },

  async getById(id: string): Promise<Pedido | null> {
    try {
      const dto = await api.get<OrderDTO>(`/orders/${encodeURIComponent(id)}`);
      return dto ? toPedido(dto) : null;
    } catch {
      return null;
    }
  },

  async me(query?: Record<string, string | number | boolean | undefined | null>): Promise<OrdersListResult> {
    const response = await api.get<{ items: OrderDTO[]; meta: PaginatedResponse<OrderDTO>['data']['meta'] }>('/orders/me', { query });
    const data = response?.items ?? [];
    const idByNumero: Record<string, string> = {};
    const pedidos = data.map((dto) => {
      idByNumero[dto.numero] = dto.id;
      return toPedido(dto);
    });
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
    return { pedidos, idByNumero, meta };
  },

  async create(input: CreateOrderInput): Promise<{ pedido: Pedido; id: string }> {
    const observaciones = [
      input.observaciones,
      input.comprobantePago ? `Comprobante: ${input.comprobantePago.name}` : null,
    ].filter(Boolean).join(' ');

    const dto = await api.post<OrderDTO>('/orders', {
      clienteId: input.clienteId,
      asesorId: input.asesorId,
      itemsList: input.itemsList,
      prioridad: input.prioridad,
      observaciones: observaciones || undefined,
      paymentMethod: input.paymentMethod,
      installments: input.installments,
    } as unknown);
    return { pedido: toPedido(dto), id: dto.id };
  },

  async updateStatus(id: string, estado: Pedido['estado']): Promise<Pedido> {
    const dto = await api.patch<OrderDTO>(
      `/orders/${encodeURIComponent(id)}/status`,
      { estado },
    );
    return toPedido(dto);
  },

  async updateOrderFull(id: string, changes: { clienteId?: string; asesorId?: string; prioridad?: Pedido['prioridad']; observaciones?: string; itemsList?: PedidoItem[] }): Promise<Pedido> {
    const dto = await api.patch<OrderDTO>(
      `/orders/${encodeURIComponent(id)}`,
      changes,
    );
    return toPedido(dto);
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/orders/${encodeURIComponent(id)}`);
  },
};
