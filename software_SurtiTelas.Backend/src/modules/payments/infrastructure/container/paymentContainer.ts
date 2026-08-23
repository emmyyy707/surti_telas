import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PrismaPaymentRepository } from '../repositories/PrismaPaymentRepository';
import { prisma } from '../../../../config/database';
import type { PaymentStatus, PaymentMethod } from '../../domain/entities/Payment';

const repository = new PrismaPaymentRepository(prisma);

export class ListPayments {
  constructor(private repo: PaymentRepository) {}
  async execute(filters: { customerId?: string; asesorId?: string; status?: PaymentStatus }) {
    return this.repo.list(filters);
  }
}

export class GetPaymentById {
  constructor(private repo: PaymentRepository) {}
  async execute(id: string) {
    return this.repo.getById(id);
  }
}

export class CreatePayment {
  constructor(private repo: PaymentRepository) {}
  async execute(input: { orderId: string; customerId: string; asesorId?: string; amount: number; method: PaymentMethod; reference?: string; notes?: string }) {
    return this.repo.create(input);
  }
}

export class UpdatePaymentStatus {
  constructor(private repo: PaymentRepository) {}
  async execute(id: string, status: PaymentStatus, paidAt?: string) {
    return this.repo.updateStatus(id, status, paidAt);
  }
}

export class UpdatePayment {
  constructor(private repo: PaymentRepository) {}
  async execute(id: string, changes: { amount?: number; method?: PaymentMethod; reference?: string; notes?: string }) {
    return this.repo.update(id, changes);
  }
}

export class DeletePayment {
  constructor(private repo: PaymentRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}

export class GetCustomerBalance {
  constructor(private repo: PaymentRepository) {}
  async execute(customerId: string) {
    return this.repo.getCustomerBalance(customerId);
  }
}

export class GetQuoteBalance {
  constructor(private prisma: any) {}
  async execute(quoteId: string) {
    const quote = await this.prisma.quotes.findFirst({ where: { id: quoteId, deleted_at: null } });
    if (!quote) {
      throw new Error('Cotización no encontrada');
    }

    const payments = await this.prisma.payment.findMany({
      where: { orderId: quote.custom_order_id ?? undefined, deletedAt: null, status: 'APPROVED' },
    });

    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const total = Number(quote.total);
    const saldo = total - totalPaid;

    return {
      quoteId,
      total,
      totalPaid,
      saldo,
      porcentajeAnticipo: quote.porcentaje_anticipo ?? 50,
      valorAnticipo: Number(quote.valor_anticipo) || 0,
    };
  }
}

export const paymentUseCases = {
  listPayments: new ListPayments(repository),
  getPaymentById: new GetPaymentById(repository),
  createPayment: new CreatePayment(repository),
  updatePaymentStatus: new UpdatePaymentStatus(repository),
  updatePayment: new UpdatePayment(repository),
  deletePayment: new DeletePayment(repository),
  getCustomerBalance: new GetCustomerBalance(repository),
  getQuoteBalance: new GetQuoteBalance(prisma),
};
