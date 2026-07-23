import { ReportRepository } from '../../domain/repositories/ReportRepository';

export class GetInventoryReport {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute() {
    return this.reportRepository.getInventoryReport();
  }
}
