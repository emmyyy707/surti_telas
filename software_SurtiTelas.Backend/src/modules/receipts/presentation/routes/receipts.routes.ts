import { Router } from 'express';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '../../../auth/presentation/middlewares/authorize';
import { listReceipts, getReceipt, createReceipt, listMyReceipts, updateReceipt, updateReceiptStatus, deleteReceipt } from '../controllers/receipt.controller';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('receipts:read'), listReceipts);
router.get('/me', requireRole('CLIENTE'), listMyReceipts);
router.get('/:id', requirePermission('receipts:read'), getReceipt);
router.post('/', requirePermission('receipts:create'), createReceipt);
router.patch('/:id', requirePermission('receipts:update'), updateReceipt);
router.patch('/:id/status', requirePermission('receipts:update'), updateReceiptStatus);
router.delete('/:id', requirePermission('receipts:delete'), deleteReceipt);

export const receiptsRoutes = router;
