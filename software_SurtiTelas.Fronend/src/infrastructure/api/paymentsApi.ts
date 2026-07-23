import { api } from './httpClient';

export interface PaymentDTO {
  id: string;
  orderId: string;
  customerId: string;
  asesorId?: string;
  amount: number;
  method: 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  reference?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  asesorId?: string;
  amount: number;
  method: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Reembolsado';
  reference?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function toPayment(dto: PaymentDTO): Payment {
  return {
    id: dto.id,
    orderId: dto.orderId,
    customerId: dto.customerId,
    asesorId: dto.asesorId,
    amount: Number(dto.amount),
    method: dto.method === 'CASH' ? 'Efectivo' : dto.method === 'TRANSFER' ? 'Transferencia' : dto.method === 'CARD' ? 'Tarjeta' : 'Otro',
    status: dto.status === 'PENDING' ? 'Pendiente' : dto.status === 'APPROVED' ? 'Aprobado' : dto.status === 'REJECTED' ? 'Rechazado' : 'Reembolsado',
    reference: dto.reference,
    notes: dto.notes,
    paidAt: dto.paidAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const paymentsApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<Payment[]> {
    const response = await api.get<{ items: PaymentDTO[]; meta: Record<string, unknown> }>('/payments', { query });
    const data = response?.items ?? [];
    return data.map(toPayment);
  },

  async getById(id: string): Promise<Payment | null> {
    try {
      const dto = await api.get<PaymentDTO>(`/payments/${encodeURIComponent(id)}`);
      return dto ? toPayment(dto) : null;
    } catch {
      return null;
    }
  },

  async create(data: Partial<Payment>): Promise<Payment> {
    const body: Record<string, unknown> = {
      orderId: data.orderId,
      customerId: data.customerId,
      asesorId: data.asesorId,
      amount: data.amount,
      method: data.method === 'Efectivo' ? 'CASH' : data.method === 'Transferencia' ? 'TRANSFER' : data.method === 'Tarjeta' ? 'CARD' : 'OTHER',
      reference: data.reference,
      notes: data.notes,
    };
    const dto = await api.post<PaymentDTO>('/payments', body);
    return toPayment(dto);
  },

  async updateStatus(id: string, status: Payment['status']): Promise<Payment> {
    const dto = await api.patch<PaymentDTO>(`/payments/${encodeURIComponent(id)}/status`, {
      status: status === 'Pendiente' ? 'PENDING' : status === 'Aprobado' ? 'APPROVED' : status === 'Rechazado' ? 'REJECTED' : 'REFUNDED',
    });
    return toPayment(dto);
  },

  async update(id: string, changes: Partial<Payment>): Promise<Payment> {
    const body: Record<string, unknown> = {};
    if (changes.amount !== undefined) body.amount = changes.amount;
    if (changes.method !== undefined) body.method = changes.method === 'Efectivo' ? 'CASH' : changes.method === 'Transferencia' ? 'TRANSFER' : changes.method === 'Tarjeta' ? 'CARD' : 'OTHER';
    if (changes.reference !== undefined) body.reference = changes.reference;
    if (changes.notes !== undefined) body.notes = changes.notes;
    const dto = await api.patch<PaymentDTO>(`/payments/${encodeURIComponent(id)}`, body);
    return toPayment(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/payments/${encodeURIComponent(id)}`);
  },
};
