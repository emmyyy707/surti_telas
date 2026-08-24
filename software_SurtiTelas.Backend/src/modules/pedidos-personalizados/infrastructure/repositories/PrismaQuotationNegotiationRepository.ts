import { PrismaClient } from '@prisma/client';
import { QuotationNegotiationRepository } from '../../domain/repositories/CustomOrderRepository';

export class PrismaQuotationNegotiationRepository implements QuotationNegotiationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    const row = await prisma.quote_negotiations.create({ data });
    return row;
  }

  async findByQuoteId(quoteId: string, tx?: any) {
    const prisma = tx ?? this.prisma;
    return prisma.quote_negotiations.findMany({
      where: { quote_id: quoteId, deleted_at: null },
      orderBy: { created_at: 'asc' },
    });
  }

  async findById(id: string, tx?: any) {
    const prisma = tx ?? this.prisma;
    return prisma.quote_negotiations.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async update(id: string, changes: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    const data: Record<string, unknown> = {};
    if (changes.message !== undefined) data.message = changes.message;
    if (changes.proposalData !== undefined) data.proposal_data = changes.proposalData;
    if (changes.status !== undefined) data.status = changes.status;
    if (changes.round !== undefined) data.round = changes.round;
    data.updated_at = new Date();
    return prisma.quote_negotiations.update({ where: { id }, data });
  }
}
