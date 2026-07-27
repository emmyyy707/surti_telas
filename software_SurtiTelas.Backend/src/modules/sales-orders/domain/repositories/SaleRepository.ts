import type { Sale } from '../entities/Sale';

export type { Sale } from '../entities/Sale';

export interface SaleRepository {
  create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale>;
  findByOrderId(orderId: string): Promise<Sale | null>;
  list(filters?: { clienteId?: string; asesorId?: string; desde?: string; hasta?: string }): Promise<Sale[]>;
}
