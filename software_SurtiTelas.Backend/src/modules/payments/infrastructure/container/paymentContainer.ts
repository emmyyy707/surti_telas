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

export const paymentUseCases = {
  listPayments: new ListPayments(repository),
  getPaymentById: new GetPaymentById(repository),
  createPayment: new CreatePayment(repository),
  updatePaymentStatus: new UpdatePaymentStatus(repository),
  updatePayment: new UpdatePayment(repository),
  deletePayment: new DeletePayment(repository),
};
