import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import * as controller from '../controllers/health.controller';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(controller.healthCheck));
healthRouter.get('/backup', asyncHandler(controller.backupDatabase));
