import { Payment } from '../entities/Payment';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';

export interface PaymentRepository {
  list(filters: { customerId?: string; asesorId?: string; status?: PaymentStatus }): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;
  create(input: { orderId: string; customerId: string; asesorId?: string; amount: number; method: PaymentMethod; reference?: string; notes?: string }): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus, paidAt?: string): Promise<Payment>;
  update(id: string, changes: { amount?: number; method?: PaymentMethod; reference?: string; notes?: string }): Promise<Payment>;
  delete(id: string): Promise<void>;
}
