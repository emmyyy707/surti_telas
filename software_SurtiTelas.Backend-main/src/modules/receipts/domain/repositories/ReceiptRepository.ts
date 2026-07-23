import { Receipt } from '../entities/Receipt';

export interface ReceiptRepository {
  list(filters: { customerId?: string; orderId?: string }): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  create(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt>;
}
