import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get(
  '/dashboard',
  requirePermission('orders:read'),
  asyncHandler(controller.getDashboardAnalytics)
);

analyticsRouter.get(
  '/comparison',
  requirePermission('orders:read'),
  asyncHandler(controller.getMonthlyComparison)
);
