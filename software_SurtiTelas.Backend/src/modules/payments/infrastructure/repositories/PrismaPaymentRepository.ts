import { Payment } from '../../domain/entities/Payment';
import type { PaymentMethod, PaymentRepository, PaymentStatus } from '../../domain/entities/Payment';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async list(filters: { customerId?: string; asesorId?: string; status?: string }): Promise<{ data: Payment[]; total: number }> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.status) where.status = filters.status;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.payment.count({ where }),
    ]);
    return { data: rows.map(PaymentMapper.toDomain), total };
  }

  async getById(id: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({ where: { id, deletedAt: null } });
    return row ? PaymentMapper.toDomain(row) : null;
  }

  async create(input: { orderId: string; customerId: string; asesorId?: string; amount: number; method: string; reference?: string; notes?: string }): Promise<Payment> {
    const row = await this.prisma.payment.create({
      data: {
        orderId: input.orderId,
        customerId: input.customerId,
        asesorId: input.asesorId,
        amount: input.amount,
        method: input.method as PaymentMethod,
        reference: input.reference,
        notes: input.notes,
      },
    });
    return PaymentMapper.toDomain(row);
  }

  async updateStatus(id: string, status: string, paidAt?: string): Promise<Payment> {
    const row = await this.prisma.payment.update({
      where: { id },
      data: { status: status as PaymentStatus, paidAt: paidAt ? new Date(paidAt) : undefined },
    });
    return PaymentMapper.toDomain(row);
  }

  async update(id: string, changes: { amount?: number; method?: PaymentMethod; reference?: string; notes?: string }): Promise<Payment> {
    const row = await this.prisma.payment.update({
      where: { id },
      data: {
        ...(changes.amount !== undefined ? { amount: changes.amount } : {}),
        ...(changes.method !== undefined ? { method: changes.method } : {}),
        ...(changes.reference !== undefined ? { reference: changes.reference } : {}),
        ...(changes.notes !== undefined ? { notes: changes.notes } : {}),
      },
    });
    return PaymentMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const PaymentMapper = {
  toDomain(row: Prisma.PaymentGetPayload<object>): Payment {
    return new Payment({
      id: row.id,
      orderId: row.orderId,
      customerId: row.customerId,
      asesorId: row.asesorId ?? undefined,
      amount: Number(row.amount.toNumber()),
      method: row.method,
      status: row.status,
      reference: row.reference ?? undefined,
      notes: row.notes ?? undefined,
      paidAt: row.paidAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  },
};
