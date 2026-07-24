import { ReportRepository } from '../../domain/repositories/ReportRepository';

export class GetProductionReport {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute() {
    return this.reportRepository.getProductionReport();
  }
}
