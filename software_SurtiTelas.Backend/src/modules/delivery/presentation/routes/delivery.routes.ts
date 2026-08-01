import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/delivery.controller';

export const deliveryTrackingRouter = Router();

deliveryTrackingRouter.use(authenticate);

deliveryTrackingRouter.get(
  '/:id/tracking',
  requirePermission('orders:read'),
  asyncHandler(controller.getDeliveryStatus)
);

deliveryTrackingRouter.patch(
  '/:id/tracking',
  requirePermission('orders:update'),
  asyncHandler(controller.updateDeliveryStatus)
);

deliveryTrackingRouter.get(
  '/:id/history',
  requirePermission('orders:read'),
  asyncHandler(controller.getDeliveryHistory)
);
