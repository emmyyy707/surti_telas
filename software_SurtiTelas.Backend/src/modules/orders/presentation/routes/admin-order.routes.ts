import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/admin-order.controller';

export const adminOrderRouter = Router();

adminOrderRouter.use(authenticate);

adminOrderRouter.get(
  '/',
  requirePermission('orders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getAdminOrders)
);

adminOrderRouter.get(
  '/:id',
  requirePermission('orders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getAdminOrderById)
);

adminOrderRouter.patch(
  '/:id',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateOrderAdmin)
);

adminOrderRouter.delete(
  '/:id',
  requirePermission('orders:delete'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.deleteOrderAdmin)
);

adminOrderRouter.get(
  '/:id/history',
  requirePermission('orders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getAdminOrderHistory)
);

adminOrderRouter.get(
  '/admin/sales-summary',
  requirePermission('orders:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getAdminSalesSummary)
);