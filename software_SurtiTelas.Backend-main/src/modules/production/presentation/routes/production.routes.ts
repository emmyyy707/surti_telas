import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/production.controller';

export const productionRouter = Router();

productionRouter.use(authenticate);

productionRouter.get('/workshops', requirePermission('production:read'), asyncHandler(controller.listWorkshops));
productionRouter.post('/workshops', requirePermission('production:create'), sensitiveUserRateLimiter, asyncHandler(controller.createWorkshop));
productionRouter.patch('/workshops/:id', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateWorkshop));
productionRouter.delete('/workshops/:id', requirePermission('production:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteWorkshop));

productionRouter.get('/orders', requirePermission('production:read'), asyncHandler(controller.listProductionOrders));
productionRouter.post('/orders', requirePermission('production:create'), sensitiveUserRateLimiter, asyncHandler(controller.createProductionOrder));
productionRouter.post('/orders/:id/workshop', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.assignToWorkshop));
productionRouter.patch('/orders/:id/progress', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateProgress));
productionRouter.patch('/orders/:id', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateProductionOrder));
productionRouter.delete('/orders/:id', requirePermission('production:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteProductionOrder));
productionRouter.post('/orders/:id/complete', requirePermission('production:update'), asyncHandler(controller.completeProduction));

productionRouter.get('/alerts', requirePermission('production:read'), asyncHandler(controller.getProductionAlerts));

productionRouter.get('/control', requirePermission('production:read'), asyncHandler(controller.listControlPrendas));
productionRouter.post('/control', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.createControlPrenda));
productionRouter.patch('/control/:id/review', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.reviewControlPrenda));
productionRouter.patch('/control/:id', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateControlPrenda));
productionRouter.delete('/control/:id', requirePermission('production:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteControlPrenda));
