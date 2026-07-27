import { Receipt } from '../entities/Receipt';

export interface ReceiptRepository {
  list(filters: { customerId?: string; orderId?: string }): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  findByOrderId(orderId: string): Promise<Receipt | null>;
  create(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt>;
  update(id: string, data: { url?: string; estado?: string; estadoEnvio?: string; fechaEnvio?: Date; intentosEnvio?: number; ultimoErrorEnvio?: string }): Promise<Receipt>;
}
