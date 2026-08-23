import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/purchase.controller';

export const purchasesRouter = Router();

purchasesRouter.use(authenticate);

purchasesRouter.get('/', requirePermission('purchases:read'), asyncHandler(controller.listPurchases));
purchasesRouter.get('/:id', requirePermission('purchases:read'), asyncHandler(controller.getPurchase));
purchasesRouter.post('/', requirePermission('purchases:create'), sensitiveUserRateLimiter, asyncHandler(controller.createPurchase));
purchasesRouter.patch('/:id', requirePermission('purchases:update'), sensitiveUserRateLimiter, asyncHandler(controller.updatePurchase));
purchasesRouter.post('/:id/cancel', requirePermission('purchases:update'), sensitiveUserRateLimiter, asyncHandler(controller.cancelPurchase));
purchasesRouter.delete('/:id', requirePermission('purchases:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deletePurchase));

purchasesRouter.get('/:id/items', requirePermission('purchases:read'), asyncHandler(controller.listPurchaseItems));
purchasesRouter.post('/:id/items', requirePermission('purchases:update'), sensitiveUserRateLimiter, asyncHandler(controller.addPurchaseItem));
purchasesRouter.delete('/:id/items/:itemId', requirePermission('purchases:update'), sensitiveUserRateLimiter, asyncHandler(controller.removePurchaseItem));
purchasesRouter.get('/:id/pdf', requirePermission('purchases:read'), asyncHandler(controller.exportPurchasePdf));
