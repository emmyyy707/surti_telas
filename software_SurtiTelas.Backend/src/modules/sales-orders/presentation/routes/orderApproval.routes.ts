import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import { paymentProofUpload } from '../middlewares/paymentProofUpload';
import * as controller from '../controllers/orderApproval.controller';

export const orderApprovalRouter = Router();

orderApprovalRouter.use(authenticate);

orderApprovalRouter.post(
  '/:id/payment-proof',
  requireRole('CLIENTE'),
  paymentProofUpload.single('comprobante'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.uploadPaymentProof)
);

orderApprovalRouter.patch(
  '/:id/start-validation',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.startValidation)
);

orderApprovalRouter.post(
  '/:id/accept',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.acceptOrder)
);

orderApprovalRouter.post(
  '/:id/reject',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.rejectOrder)
);

orderApprovalRouter.post(
  '/:id/retry-receipt',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.retryReceipt)
);

orderApprovalRouter.get(
  '/admin/sales-orders/report',
  requirePermission('orders:read'),
  asyncHandler(controller.getSalesReport)
);