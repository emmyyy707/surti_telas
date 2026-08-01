import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/alert-inventory.controller';

export const alertInventoryRouter = Router();

alertInventoryRouter.use(authenticate);

alertInventoryRouter.get(
  '/check',
  requirePermission('stock:read'),
  asyncHandler(controller.checkInventoryAlerts)
);

alertInventoryRouter.get(
  '/recommendations',
  requirePermission('stock:manage'),
  asyncHandler(controller.getProductRecommendations)
);
