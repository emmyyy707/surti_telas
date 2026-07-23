import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/contact.controller';

export const contactRoutes = Router();

contactRoutes.post('/', asyncHandler(controller.createContactMessage));

contactRoutes.use(authenticate);
contactRoutes.get('/', requirePermission('contact:read'), asyncHandler(controller.listContactMessages));
contactRoutes.patch('/:id/read', requirePermission('contact:update'), asyncHandler(controller.markAsRead));
contactRoutes.post('/:id/reply', requirePermission('contact:update'), asyncHandler(controller.replyContactMessage));
contactRoutes.patch('/:id/status', requirePermission('contact:update'), asyncHandler(controller.closeContactMessage));
