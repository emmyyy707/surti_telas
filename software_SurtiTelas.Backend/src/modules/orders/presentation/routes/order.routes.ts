import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/order.controller';

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: estado
 *         schema: { type: string, example: Nuevo }
 *     responses:
 *       200:
 *         description: Paginated orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedOrders'
 */
export const orderRouter = Router();

orderRouter.use(authenticate);

/**
 * @swagger
 * /orders/dashboard:
 *   get:
 *     tags: [Orders]
 *     summary: Get dashboard metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders: { type: integer }
 *                     totalCustomers: { type: integer }
 *                     totalSales: { type: number }
 *                     ordersByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           estado: { type: string }
 *                           cantidad: { type: integer }
 */
orderRouter.get('/dashboard', requirePermission('orders:read'), asyncHandler(controller.getDashboardMetrics));

orderRouter.get('/me', requireRole('CLIENTE'), asyncHandler(controller.getOrdersMe));

orderRouter.get('/', requirePermission('orders:read'), asyncHandler(controller.getOrders));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
orderRouter.get('/:id', requirePermission('orders:read'), asyncHandler(controller.getOrderById));

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             clienteId: cliente-123
 *             asesorId: user-456
 *             prioridad: Estándar
 *             observaciones: Entregar en la mañana
 *             itemsList:
 *               - nombre: Camiseta básica
 *                 precio: 25000
 *                 cantidad: 2
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Pedido creado }
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
orderRouter.post('/', requirePermission('orders:create'), sensitiveUserRateLimiter, asyncHandler(controller.createOrder));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             estado: En producción
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Estado actualizado }
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
orderRouter.patch(
  '/:id/status',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateOrderStatus)
);

/**
 * @swagger
 * /orders/{id}/domiciliario:
 *   post:
 *     tags: [Orders]
 *     summary: Assign delivery person to order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             domiciliarioId: user-789
 *     responses:
 *       200:
 *         description: Delivery person assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Domiciliario asignado }
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
orderRouter.post(
  '/:id/domiciliario',
  requireRole('ADMIN'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.assignDomiciliario)
);

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order full
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             prioridad: Prioritario
 *             observaciones: Nueva nota
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Pedido actualizado }
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
orderRouter.patch(
  '/:id',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateOrderFull)
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 */
orderRouter.delete(
  '/:id',
  requirePermission('orders:delete'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.deleteOrder)
);
