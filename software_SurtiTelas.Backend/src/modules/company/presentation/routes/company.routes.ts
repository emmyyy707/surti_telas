import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/company.controller';

export const companyRoutes = Router();

companyRoutes.get('/', asyncHandler(controller.getCompany));
companyRoutes.patch('/', authenticate, requirePermission('company:update'), asyncHandler(controller.updateCompany));
