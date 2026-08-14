import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/custom-order.controller';

export const adminCustomOrderRouter = Router();

adminCustomOrderRouter.use(authenticate);

adminCustomOrderRouter.get(
  '/',
  requirePermission('customOrders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.listCustomOrders)
);

adminCustomOrderRouter.get(
  '/:id',
  requirePermission('customOrders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getCustomOrder)
);

adminCustomOrderRouter.patch(
  '/:id',
  requirePermission('customOrders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateCustomOrder)
);

adminCustomOrderRouter.patch(
  '/:id/status',
  requirePermission('customOrders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateCustomOrderStatus)
);

adminCustomOrderRouter.post(
  '/:id/quotation',
  requirePermission('customOrders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.generateQuotation)
);

adminCustomOrderRouter.post(
  '/:id/convert',
  requirePermission('customOrders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.convertToOrder)
);

adminCustomOrderRouter.patch(
  '/:id/payment',
  requirePermission('customOrders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updatePaymentStatus)
);
