import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/sale.controller';

export const saleRouter = Router();

saleRouter.use(authenticate);

saleRouter.get(
  '/',
  requirePermission('sales:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.listSales),
);

saleRouter.get(
  '/:id',
  requirePermission('sales:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.getSale),
);

saleRouter.get(
  '/:id/pdf',
  requirePermission('sales:read'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.generateSalePdf),
);

saleRouter.post(
  '/',
  requirePermission('sales:create'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.createSale),
);

saleRouter.post(
  '/:id/cancel',
  requirePermission('sales:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.cancelSale),
);

saleRouter.post(
  '/:id/items',
  requirePermission('sales:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.addSaleItem),
);

saleRouter.delete(
  '/:id',
  requirePermission('sales:delete'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.deleteSale),
);

saleRouter.delete(
  '/:id/items/:itemId',
  requirePermission('sales:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.removeSaleItem),
);
