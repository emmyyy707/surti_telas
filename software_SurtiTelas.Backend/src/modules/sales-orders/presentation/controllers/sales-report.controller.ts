import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { salesOrderUseCases } from '../../infrastructure/container/salesOrderContainer';
import { canViewSalesReport } from '../../application/policies/orderApprovalPolicy';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { ForbiddenError } from '../../../../shared/domain/errors';

const SalesReportQuerySchema = z.object({
  asesorId: z.string().optional(),
  clienteId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const getSalesOrdersReport = async (req: Request, res: Response) => {
  if (!canViewSalesReport(req.user!)) {
    throw new ForbiddenError('No tienes permiso para ver reportes');
  }

  const filters = parseDto(SalesReportQuerySchema, req.query);
  const report = await salesOrderUseCases.getSalesReport.execute(filters);
  return ok(res, report);
};

