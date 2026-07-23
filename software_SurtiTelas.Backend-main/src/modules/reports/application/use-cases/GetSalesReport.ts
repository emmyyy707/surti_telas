import { ReportRepository } from '../../domain/repositories/ReportRepository';
import { PrismaClient } from '@prisma/client';

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export class GetSalesReport {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(range?: DateRangeFilter) {
    return this.reportRepository.getSalesReport(range);
  }
}

export { PrismaClient };
