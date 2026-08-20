export interface CustomOrderFilters {
  estado?: string;
  clienteId?: string;
  asesorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomOrderListResult {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    nextCursor?: string;
  };
}

export interface CustomOrderRepository {
  list(filters: CustomOrderFilters): Promise<CustomOrderListResult>;
  getById(id: string): Promise<any>;
  getByNumero(numero: string): Promise<any>;
  create(data: any, tx?: any): Promise<any>;
  update(id: string, changes: any, tx?: any): Promise<any>;
  remove(id: string, tx?: any): Promise<void>;
  nextNumero(): Promise<string>;
}

export interface QuotationRepository {
  getByPedidoId(pedidoPersonalizadoId: string): Promise<any>;
  create(data: any, tx?: any): Promise<any>;
  update(id: string, changes: any, tx?: any): Promise<any>;
  nextNumero(): Promise<string>;
}

export interface CustomOrderItemRepository {
  createManyByPedidoId(pedidoPersonalizadoId: string, items: any[], tx?: any): Promise<void>;
  findByPedidoId(pedidoPersonalizadoId: string, tx?: any): Promise<any[]>;
}

export interface CustomOrderPersonalizationRepository {
  createManyByItemId(itemId: string, personalizaciones: any[], tx?: any): Promise<void>;
  findByItemId(itemId: string, tx?: any): Promise<any[]>;
}

export interface CustomOrderVariantRepository {
  createManyByPersonalizationId(personalizationId: string, variants: any[], tx?: any): Promise<void>;
  findByPersonalizationId(personalizationId: string, tx?: any): Promise<any[]>;
}

export interface CustomOrderHistoryRepository {
  create(data: {
    customOrderId: string;
    usuarioId?: string;
    accion: string;
    estadoAnterior: string;
    estadoNuevo: string;
    razon?: string;
    informacion?: any;
  }): Promise<any>;
  findByCustomOrderId(customOrderId: string): Promise<any[]>;
}
