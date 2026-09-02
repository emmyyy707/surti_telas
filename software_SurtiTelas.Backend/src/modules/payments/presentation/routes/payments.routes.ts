import { Router } from 'express';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { listPayments, getPayment, createPayment, updatePaymentStatus, updatePayment, deletePayment, cancelPayment, getCustomerBalance, getQuoteBalance, exportPaymentPdf } from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('payments:read'), asyncHandler(listPayments));
router.get('/:id', requirePermission('payments:read'), asyncHandler(getPayment));
router.post('/', requirePermission('payments:create'), asyncHandler(createPayment));
router.patch('/:id/status', requirePermission('payments:update'), asyncHandler(updatePaymentStatus));
router.patch('/:id', requirePermission('payments:update'), asyncHandler(updatePayment));
router.delete('/:id', requirePermission('payments:delete'), asyncHandler(deletePayment));
router.patch('/:id/cancel', requirePermission('payments:update'), asyncHandler(cancelPayment));

router.get('/customers/:customerId/balance', requirePermission('payments:read'), asyncHandler(getCustomerBalance));
router.get('/quotes/:quoteId/balance', requirePermission('payments:read'), asyncHandler(getQuoteBalance));
router.get('/:id/pdf', requirePermission('payments:read'), asyncHandler(exportPaymentPdf));

export const paymentsRoutes = router;
