import { Router } from 'express';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { listPayments, getPayment, createPayment, updatePaymentStatus, updatePayment, deletePayment } from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('payments:read'), listPayments);
router.get('/:id', requirePermission('payments:read'), getPayment);
router.post('/', requirePermission('payments:create'), createPayment);
router.patch('/:id/status', requirePermission('payments:update'), updatePaymentStatus);
router.patch('/:id', requirePermission('payments:update'), updatePayment);
router.delete('/:id', requirePermission('payments:delete'), deletePayment);

export const paymentsRoutes = router;
