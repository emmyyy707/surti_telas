import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/export.controller';

export const exportRouter = Router();

exportRouter.use(authenticate);

exportRouter.post(
  '/export',
  requirePermission('reports:read'),
  asyncHandler(controller.exportData)
);

exportRouter.get(
  '/export/:type',
  requirePermission('reports:read'),
  asyncHandler(controller.exportReport)
);
