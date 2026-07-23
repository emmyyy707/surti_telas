import { Router } from 'express';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { listCommissions, getCommission, createCommission } from '../controllers/commission.controller';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('commissions:read'), listCommissions);
router.get('/:id', requirePermission('commissions:read'), getCommission);
router.post('/', requirePermission('commissions:create'), createCommission);

export const commissionsRoutes = router;
