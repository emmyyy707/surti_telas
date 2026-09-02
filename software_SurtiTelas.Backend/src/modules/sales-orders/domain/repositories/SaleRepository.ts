import type { Sale } from '../entities/Sale';

export type { Sale } from '../entities/Sale';

export interface SaleItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  productId?: string | null;
}

export interface SaleWithOrder {
  id: string;
  orderId: string;
  clienteId: string;
  clienteNombre: string;
  asesorId: string;
  asesorNombre: string;
  fechaVenta: string;
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  estado: string;
  motivoAnulacion?: string;
  medioPago?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    numero: string;
    estado: string;
    tipoFlujo: string;
    fecha: string;
    medioPago?: string;
    items: SaleItem[];
    payment?: { id: string; amount: number; status: string; method: string; paidAt?: string | null } | null;
    receipt?: { id: string; numero: string; estado: string; estadoEnvio?: string | null } | null;
    customOrder?: { id: string; numero: string; estado: string } | null;
  };
}

export interface SaleRepository {
  create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale>;
  findByOrderId(orderId: string): Promise<Sale | null>;
  findById(id: string): Promise<Sale | null>;
  list(filters?: { clienteId?: string; asesorId?: string; desde?: string; hasta?: string }): Promise<Sale[]>;
  cancel(id: string, motivoAnulacion: string): Promise<Sale>;
  updateTotals(id: string, totals: { subtotal: number; impuestos: number; descuentos: number; total: number }): Promise<Sale>;
  findByIdWithOrder(id: string): Promise<SaleWithOrder | null>;
  delete(id: string): Promise<void>;
}
