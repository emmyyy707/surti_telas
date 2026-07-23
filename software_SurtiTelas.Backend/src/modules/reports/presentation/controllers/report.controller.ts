import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { reportUseCases } from '../../infrastructure/container/reportContainer';
import { DateRangeSchema } from '../validators/report.validators';

export const getSalesReport = async (req: Request, res: Response) => {
  const range = parseDto(DateRangeSchema, req.query);
  const data = await reportUseCases.getSalesReport.execute(range);
  return ok(res, data);
};

export const getInventoryReport = async (_req: Request, res: Response) => {
  const data = await reportUseCases.getInventoryReport.execute();
  return ok(res, data);
};

export const getProductionReport = async (_req: Request, res: Response) => {
  const data = await reportUseCases.getProductionReport.execute();
  return ok(res, data);
};

export const getUsersReport = async (req: Request, res: Response) => {
  const range = parseDto(DateRangeSchema, req.query);
  const data = await reportUseCases.getUsersReport.execute(range);
  return ok(res, data);
};
