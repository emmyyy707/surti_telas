import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/audit.controller';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.get('/', requirePermission('auth:manage'), asyncHandler(controller.listAuditLogs));
auditRouter.get('/logs', requirePermission('auth:manage'), asyncHandler(controller.listAuditLogs));
auditRouter.post('/', sensitiveUserRateLimiter, asyncHandler(controller.createAuditLog));
auditRouter.get('/:id', requirePermission('auth:manage'), asyncHandler(controller.getAuditLog));
auditRouter.patch('/:id', requirePermission('auth:manage'), asyncHandler(controller.updateAuditLog));
auditRouter.delete('/:id', requirePermission('auth:manage'), sensitiveUserRateLimiter, asyncHandler(controller.deleteAuditLog));
