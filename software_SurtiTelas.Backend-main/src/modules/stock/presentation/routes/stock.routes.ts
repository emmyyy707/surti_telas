import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/stock.controller';

export const stockRouter = Router();

stockRouter.use(authenticate);

stockRouter.get('/suppliers', requirePermission('stock:read'), asyncHandler(controller.listSuppliers));
stockRouter.get('/suppliers/:id', requirePermission('stock:read'), asyncHandler(controller.getSupplier));
stockRouter.post('/suppliers', requirePermission('stock:create'), sensitiveUserRateLimiter, asyncHandler(controller.createSupplier));
stockRouter.patch('/suppliers/:id', requirePermission('stock:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateSupplier));
stockRouter.delete('/suppliers/:id', requirePermission('stock:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteSupplier));

stockRouter.get('/raw-materials', requirePermission('stock:read'), asyncHandler(controller.listRawMaterials));
stockRouter.post('/raw-materials', requirePermission('stock:create'), sensitiveUserRateLimiter, asyncHandler(controller.createRawMaterial));
stockRouter.patch('/raw-materials/:id', requirePermission('stock:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateRawMaterial));
stockRouter.delete('/raw-materials/:id', requirePermission('stock:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteRawMaterial));

stockRouter.post('/movements', requirePermission('stock:move'), sensitiveUserRateLimiter, asyncHandler(controller.registerMovement));
stockRouter.get('/movements', requirePermission('stock:read'), asyncHandler(controller.listMovements));

stockRouter.get('/alerts', requirePermission('stock:read'), asyncHandler(controller.getStockAlerts));
