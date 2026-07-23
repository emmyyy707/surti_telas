export type OrderStatus =
  | 'Nuevo'
  | 'En producción'
  | 'Listo'
  | 'Despachado'
  | 'En camino'
  | 'Entregado'
  | 'Cancelado';

export type OrderPriority = 'Estándar' | 'Prioritario';

export interface OrderItem {
  productId?: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface OrderData {
  id: string;
  numero: string;
  cliente: string;
  asesor: string;
  fecha: string;
  items: number;
  total: number;
  estado: OrderStatus;
  prioridad?: OrderPriority;
  observaciones?: string;
  itemsList?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export class Order {
  readonly id: string;
  readonly numero: string;
  readonly cliente: string;
  readonly asesor: string;
  readonly fecha: string;
  readonly items: number;
  readonly total: number;
  readonly estado: OrderStatus;
  readonly prioridad?: OrderPriority;
  readonly observaciones?: string;
  readonly itemsList?: OrderItem[];
  readonly createdAt?: string;
  readonly updatedAt?: string;

  constructor(data: OrderData) {
    Order.validate(data);

    this.id = data.id;
    this.numero = data.numero;
    this.cliente = data.cliente;
    this.asesor = data.asesor;
    this.fecha = data.fecha;
    this.items = data.items;
    this.total = data.total;
    this.estado = data.estado;
    this.prioridad = data.prioridad;
    this.observaciones = data.observaciones;
    this.itemsList = data.itemsList;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data: OrderData): void {
    if (!data.id.trim()) {
      throw new Error('El pedido debe tener un identificador');
    }
    if (!data.cliente.trim()) {
      throw new Error('El pedido debe tener un cliente asociado');
    }
    if (!data.asesor.trim()) {
      throw new Error('El pedido debe tener un asesor asignado');
    }
    if (!Number.isFinite(data.total) || data.total < 0) {
      throw new Error('El total del pedido debe ser mayor o igual a cero');
    }
    if (!Number.isInteger(data.items) || data.items < 0) {
      throw new Error('La cantidad de items del pedido debe ser un número entero positivo');
    }
    const itemsList = data.itemsList ?? [];
    if (itemsList.length === 0) {
      throw new Error('El pedido debe tener al menos un item');
    }

    const itemsTotal = itemsList.reduce((sum, item) => sum + item.cantidad, 0);
    if (itemsTotal !== data.items) {
      throw new Error('La cantidad de items no coincide con la suma de itemsList');
    }

    const invalidItems = itemsList.filter(
      (item) =>
        !item.nombre.trim() ||
        !Number.isFinite(item.precio) ||
        item.precio < 0 ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0
    );
    if (invalidItems.length > 0) {
      throw new Error('El pedido contiene items inválidos');
    }
  }

  withStatus(estado: OrderStatus, updatedAt?: string): Order {
    const nextUpdatedAt = updatedAt ?? new Date().toISOString();
    return new Order({ ...this, estado, updatedAt: nextUpdatedAt });
  }

  getItemsCount(): number {
    return this.items;
  }

  canTransitionTo(nextStatus: OrderStatus): boolean {
    if (nextStatus === this.estado) return true;

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      Nuevo: ['En producción', 'Cancelado'],
      'En producción': ['Listo', 'Cancelado'],
      Listo: ['Despachado', 'Cancelado'],
      Despachado: ['En camino', 'Cancelado'],
      'En camino': ['Entregado'],
      Entregado: [],
      Cancelado: [],
    };

    return allowedTransitions[this.estado].includes(nextStatus);
  }
}
