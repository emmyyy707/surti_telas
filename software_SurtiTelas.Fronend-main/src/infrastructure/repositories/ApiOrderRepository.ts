import { Order, type OrderStatus } from '@/domain/entities/Order';
import type { CreateOrderInput, OrderRepository } from '@/domain/repositories/OrderRepository';
import { api } from '@/infrastructure/api/httpClient';
import type { OrderDTO } from '@/infrastructure/api/ordersApi';

/**
 * Implementación HTTP del OrderRepository (reemplaza LocalStorageOrderRepository).
 * Consume el backend real /orders. El `id` del dominio es el cuid del backend.
 */
function toDomain(dto: OrderDTO): Order {
  return new Order({
    id: dto.id,
    cliente: dto.cliente,
    asesor: dto.asesor,
    fecha: dto.fecha,
    items: dto.items,
    total: dto.total,
    estado: dto.estado,
    prioridad: dto.prioridad,
    observaciones: dto.observaciones,
    itemsList: dto.itemsList,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
}

export class ApiOrderRepository implements OrderRepository {
  async list(): Promise<Order[]> {
    const response = await api.get<{ data: OrderDTO[]; meta: Record<string, unknown> }>('/orders');
    const data = response?.data ?? [];
    return data.map(toDomain);
  }

  async getById(id: string): Promise<Order | null> {
    try {
      const dto = await api.get<OrderDTO>(`/orders/${encodeURIComponent(id)}`);
      return dto ? toDomain(dto) : null;
    } catch {
      return null;
    }
  }

  async create(input: CreateOrderInput): Promise<Order> {
    // Nota: contra el backend, `input.cliente` debe ser el clienteId (cuid).
    const dto = await api.post<OrderDTO>('/orders', {
      clienteId: input.cliente,
      itemsList: input.itemsList,
      prioridad: input.prioridad,
      observaciones: input.observaciones,
    });
    return toDomain(dto);
  }

  async updateStatus(id: string, estado: OrderStatus): Promise<Order> {
    const dto = await api.patch<OrderDTO>(`/orders/${encodeURIComponent(id)}/status`, { estado });
    return toDomain(dto);
  }
}
