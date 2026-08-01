import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/commission.controller';

export const commissionRouter = Router();

commissionRouter.use(authenticate);

commissionRouter.get(
  '/report',
  requirePermission('commissions:read'),
  asyncHandler(controller.getCommissionReport)
);
