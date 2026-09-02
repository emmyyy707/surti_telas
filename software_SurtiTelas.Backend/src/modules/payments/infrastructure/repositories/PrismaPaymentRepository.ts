import { Payment } from '../../domain/entities/Payment';
import type { PaymentMethod, PaymentRepository, PaymentStatus } from '../../domain/entities/Payment';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: { customerId?: string; asesorId?: string; status?: string; search?: string }): Promise<{ data: Payment[]; total: number }> {
    const where: Prisma.PaymentWhereInput = { deletedAt: null };
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.status) where.status = filters.status as PaymentStatus;

    if (filters.search) {
      const s = filters.search;
      where.OR = [
        { order: { numero: { contains: s, mode: 'insensitive' } } },
        { customer: { nombre: { contains: s, mode: 'insensitive' } } },
        { customer: { apellidos: { contains: s, mode: 'insensitive' } } },
        { customer: { nit: { contains: s, mode: 'insensitive' } } },
        { customer: { email: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { id: true, numero: true, total: true, estado: true } },
          customer: { select: { id: true, nombre: true, apellidos: true, nit: true, email: true } },
          asesor: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data: rows.map((row) => PaymentMapper.toDomainWithRelations(row as any)), total };
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

  async cancel(id: string, motivoAnulacion: string): Promise<Payment> {
    const row = await this.prisma.payment.update({
      where: { id },
      data: {
        status: 'ANULADO',
        motivoAnulacion,
        fechaAnulacion: new Date(),
      },
    });
    return PaymentMapper.toDomain(row);
  }

  async getCustomerBalance(customerId: string): Promise<{ totalPaid: number; pending: number; customerId: string }> {
    const [approvedResult, pendingResult] = await this.prisma.$transaction([
      this.prisma.payment.aggregate({
        where: { customerId, status: 'APPROVED', deletedAt: null },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { customerId, status: 'PENDING', deletedAt: null },
        _sum: { amount: true },
      }),
    ]);

    return {
      customerId,
      totalPaid: Number(approvedResult._sum.amount) || 0,
      pending: Number(pendingResult._sum.amount) || 0,
    };
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
    motivoAnulacion: row.motivoAnulacion ?? undefined,
    fechaAnulacion: row.fechaAnulacion?.toISOString(),
  });
  },
  toDomainWithRelations(row: any): Payment {
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
      orderNumero: row.order?.numero,
      customerNombre: row.customer ? `${row.customer.nombre} ${row.customer.apellidos ?? ''}`.trim() : undefined,
      asesorNombre: row.asesor?.nombre,
      orderTotal: row.order ? Number(row.order.total) : undefined,
      orderEstado: row.order?.estado,
      motivoAnulacion: row.motivoAnulacion ?? undefined,
      fechaAnulacion: row.fechaAnulacion?.toISOString(),
    });
  },
};
