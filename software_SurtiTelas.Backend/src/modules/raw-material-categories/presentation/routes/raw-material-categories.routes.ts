import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/raw-material-category.controller';

export const rawMaterialCategoriesRouter = Router();

rawMaterialCategoriesRouter.use(authenticate);

rawMaterialCategoriesRouter.get('/', requirePermission('stock:read'), asyncHandler(controller.listRawMaterialCategories));
rawMaterialCategoriesRouter.get('/:id', requirePermission('stock:read'), asyncHandler(controller.getRawMaterialCategory));
rawMaterialCategoriesRouter.post('/', requirePermission('stock:create'), sensitiveUserRateLimiter, asyncHandler(controller.createRawMaterialCategory));
rawMaterialCategoriesRouter.patch('/:id', requirePermission('stock:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateRawMaterialCategory));
rawMaterialCategoriesRouter.delete('/:id', requirePermission('stock:delete'), sensitiveUserRateLimiter, asyncHandler(controller.deleteRawMaterialCategory));
