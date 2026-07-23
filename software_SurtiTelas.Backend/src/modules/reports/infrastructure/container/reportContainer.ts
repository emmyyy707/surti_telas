import { prisma } from '../../../../config/database';
import { PrismaReportRepository } from '../repositories/PrismaReportRepository';
import { GetSalesReport } from '../../application/use-cases/GetSalesReport';
import { GetInventoryReport } from '../../application/use-cases/GetInventoryReport';
import { GetProductionReport } from '../../application/use-cases/GetProductionReport';
import { GetUsersReport } from '../../application/use-cases/GetUsersReport';

const reportRepository = new PrismaReportRepository(prisma);

export const reportUseCases = {
  getSalesReport: new GetSalesReport(reportRepository),
  getInventoryReport: new GetInventoryReport(reportRepository),
  getProductionReport: new GetProductionReport(reportRepository),
  getUsersReport: new GetUsersReport(reportRepository),
};
