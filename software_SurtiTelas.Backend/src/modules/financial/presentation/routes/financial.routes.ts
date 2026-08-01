import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/financial.controller';

export const financialRouter = Router();

financialRouter.use(authenticate);

financialRouter.get(
  '/report',
  requirePermission('reports:read'),
  asyncHandler(controller.getFinancialReport)
);
