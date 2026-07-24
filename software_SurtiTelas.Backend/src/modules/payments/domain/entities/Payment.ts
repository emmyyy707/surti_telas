export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';

export interface PaymentData {
  id: string;
  orderId: string;
  customerId: string;
  asesorId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class Payment {
  readonly id: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly asesorId?: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly reference?: string;
  readonly notes?: string;
  readonly paidAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(data: PaymentData) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.customerId = data.customerId;
    this.asesorId = data.asesorId;
    this.amount = data.amount;
    this.method = data.method;
    this.status = data.status;
    this.reference = data.reference;
    this.notes = data.notes;
    this.paidAt = data.paidAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export interface PaymentRepository {
  list(filters: { customerId?: string; asesorId?: string; status?: PaymentStatus }): Promise<{ data: Payment[]; total: number }>;
  getById(id: string): Promise<Payment | null>;
  create(input: { orderId: string; customerId: string; asesorId?: string; amount: number; method: PaymentMethod; reference?: string; notes?: string }): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus, paidAt?: string): Promise<Payment>;
}
