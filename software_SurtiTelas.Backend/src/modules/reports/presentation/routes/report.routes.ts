import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/report.controller';

export const reportRouter = Router();

reportRouter.use(authenticate);

/**
 * @swagger
 * /reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: Sales report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Sales aggregated report
 */
reportRouter.get(
  '/sales',
  requirePermission('orders:read'),
  asyncHandler(controller.getSalesReport)
);

/**
 * @swagger
 * /reports/inventory:
 *   get:
 *     tags: [Reports]
 *     summary: Inventory report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory aggregated report
 */
reportRouter.get(
  '/inventory',
  requirePermission('stock:read'),
  asyncHandler(controller.getInventoryReport)
);

/**
 * @swagger
 * /reports/production:
 *   get:
 *     tags: [Reports]
 *     summary: Production report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Production aggregated report
 */
reportRouter.get(
  '/production',
  requirePermission('production:read'),
  asyncHandler(controller.getProductionReport)
);

/**
 * @swagger
 * /reports/users:
 *   get:
 *     tags: [Reports]
 *     summary: Users report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Users aggregated report
 */
reportRouter.get(
  '/users',
  requirePermission('auth:manage'),
  asyncHandler(controller.getUsersReport)
);
