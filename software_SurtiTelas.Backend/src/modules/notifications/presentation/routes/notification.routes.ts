import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/notification.controller';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: leida
 *         schema: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Notifications list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, example: notif-123 }
 *                       tipo: { type: string, example: SUCCESS }
 *                       titulo: { type: string, example: Pedido creado }
 *                       mensaje: { type: string, example: Pedido PED-000001 ... }
 *                       leida: { type: boolean, example: false }
 */
notificationRouter.get('/', asyncHandler(controller.getNotifications));
notificationRouter.get('/unread-count', asyncHandler(controller.getUnreadCount));
notificationRouter.get('/sidebar-summary', asyncHandler(controller.getSidebarSummary));
notificationRouter.post('/', requirePermission('notifications:update'), asyncHandler(controller.createNotification));
notificationRouter.get('/:id', asyncHandler(controller.getNotificationById));
notificationRouter.patch('/:id/read', asyncHandler(controller.markAsRead));
notificationRouter.patch('/read-all', asyncHandler(controller.markAllAsRead));
notificationRouter.delete('/', asyncHandler(controller.deleteAllNotifications));
notificationRouter.patch('/:id', asyncHandler(controller.updateNotification));
notificationRouter.delete('/:id', asyncHandler(controller.deleteNotification));
