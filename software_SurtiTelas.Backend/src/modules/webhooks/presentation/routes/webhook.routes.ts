import { Router } from 'express';
import { listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook } from '../controllers/webhook.controller';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requireRole } from '../../../auth/presentation/middlewares/authorize';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', listWebhooks);
router.get('/:id', getWebhook);
router.post('/', createWebhook);
router.patch('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);

export const webhookRouter = router;
