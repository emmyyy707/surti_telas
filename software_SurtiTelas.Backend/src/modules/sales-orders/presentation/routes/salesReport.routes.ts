import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/sales-report.controller';

export const salesReportRouter = Router();

salesReportRouter.use(authenticate);

salesReportRouter.get(
  '/admin/sales-orders/report',
  requirePermission('orders:read'),
  asyncHandler(controller.getSalesOrdersReport)
);