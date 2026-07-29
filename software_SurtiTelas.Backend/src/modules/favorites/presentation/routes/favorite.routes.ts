import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/favorite.controller';

export const favoriteRouter = Router();

favoriteRouter.use(authenticate);

favoriteRouter.get('/', requirePermission('catalog:read'), asyncHandler(controller.listMyFavorites));

favoriteRouter.post('/:productId/toggle', requirePermission('catalog:read'), asyncHandler(controller.toggleMyFavorite));
