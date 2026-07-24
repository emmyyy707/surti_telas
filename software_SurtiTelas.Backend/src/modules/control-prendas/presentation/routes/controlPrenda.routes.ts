import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/controlPrenda.controller';

export const controlPrendaRouter = Router();

controlPrendaRouter.use(authenticate);

controlPrendaRouter.get('/control', requirePermission('production:read'), asyncHandler(controller.listControlPrendas));
controlPrendaRouter.get('/control/:id', requirePermission('production:read'), asyncHandler(controller.getControlPrenda));
controlPrendaRouter.post('/control', requirePermission('production:create'), sensitiveUserRateLimiter, asyncHandler(controller.createControlPrenda));
controlPrendaRouter.patch('/control/:id', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.updateControlPrenda));
controlPrendaRouter.patch('/control/:id/review', requirePermission('production:update'), sensitiveUserRateLimiter, asyncHandler(controller.reviewControlPrenda));
