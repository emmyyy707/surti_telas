import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/alert.controller';

export const alertRouter = Router();

alertRouter.use(authenticate);

alertRouter.get('/', requirePermission('alerts:read'), asyncHandler(controller.listAlerts));

alertRouter.get('/:id', requirePermission('alerts:read'), asyncHandler(controller.getAlert));

alertRouter.post('/', requirePermission('alerts:create'), sensitiveUserRateLimiter, asyncHandler(controller.createAlert));

alertRouter.patch('/:id/read', requirePermission('alerts:update'), asyncHandler(controller.markAsRead));

alertRouter.patch('/:id/resolve', requirePermission('alerts:update'), asyncHandler(controller.markAsResolved));
