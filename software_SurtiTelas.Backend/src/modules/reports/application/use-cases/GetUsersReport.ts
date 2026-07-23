import { ReportRepository } from '../../domain/repositories/ReportRepository';
import { DateRangeFilter } from './GetSalesReport';

export class GetUsersReport {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(range?: DateRangeFilter) {
    return this.reportRepository.getUsersReport(range);
  }
}
