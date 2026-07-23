import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/cms.controller';

export const cmsRoutes = Router();

cmsRoutes.use(authenticate);

cmsRoutes.get('/', asyncHandler(controller.listCmsPages));
cmsRoutes.get('/:id', asyncHandler(controller.getCmsPage));
cmsRoutes.post('/', requirePermission('cms:update'), asyncHandler(controller.createCmsPage));
cmsRoutes.patch('/:id', requirePermission('cms:update'), asyncHandler(controller.updateCmsPage));
