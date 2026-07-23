import { Request, Response, Router, NextFunction } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/delivery.controller';

const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id as string;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const isCuid = /^c[0-9a-z]{20,}$/i.test(id);
  if (!id || !(isUuid || isCuid)) {
    res.status(404).json({ success: false, error: 'not_found', message: 'Recurso no encontrado' });
    return;
  }
  next();
};

export const deliveryRouter = Router();

deliveryRouter.use(authenticate);

/**
 * @openapi
 * /api/v1/deliveries:
 *   get:
 *     summary: Listar entregas/domicilios
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: estado, schema: { type: string, enum: [ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO] } }
 *       - { in: query, name: domiciliarioId, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Lista paginada de entregas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Delivery' } }
 *                 meta: { $ref: '#/components/schemas/Paginated' }
 *   post:
 *     summary: Crear entrega/domicilio
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *               domiciliarioId: { type: string }
 *               direccion: { type: string }
 *               ciudad: { type: string }
 *               telefono: { type: string }
 *               notas: { type: string }
 *     responses:
 *       201:
 *         description: Entrega creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Delivery' }
 */
deliveryRouter.get(
  '/',
  requirePermission('orders:read'),
  asyncHandler(controller.listDeliveries)
);

/**
 * @openapi
 * /api/v1/deliveries/{id}:
 *   get:
 *     summary: Obtener entrega por ID
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Delivery' }
 *       404: { description: No encontrada }
 *   patch:
 *     summary: Actualizar entrega
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               domiciliarioId: { type: string }
 *               direccion: { type: string }
 *               ciudad: { type: string }
 *               telefono: { type: string }
 *               notas: { type: string }
 *               estado: { type: string, enum: [ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO] }
 *     responses:
 *       200:
 *         description: Entrega actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Delivery' }
 *       404: { description: No encontrada }
 *   delete:
 *     summary: Eliminar entrega (soft delete)
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Eliminada }
 *       404: { description: No encontrada }
 */
deliveryRouter.get(
  '/:id',
  requirePermission('orders:read'),
  validateIdParam,
  asyncHandler(controller.getDelivery)
);

deliveryRouter.post(
  '/',
  requirePermission('orders:create'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.createDelivery)
);

deliveryRouter.patch(
  '/:id',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  validateIdParam,
  asyncHandler(controller.updateDelivery)
);

/**
 * @openapi
 * /api/v1/deliveries/{id}/status:
 *   post:
 *     summary: Cambiar estado de entrega
 *     tags: [Deliveries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Delivery' }
 *       404: { description: No encontrada }
 */
deliveryRouter.post(
  '/:id/status',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  validateIdParam,
  asyncHandler(controller.changeDeliveryStatus)
);

deliveryRouter.delete(
  '/:id',
  requireRole('ADMIN'),
  sensitiveUserRateLimiter,
  validateIdParam,
  asyncHandler(controller.deleteDelivery)
);
