import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '../../../auth/presentation/middlewares/authorize';
import { sensitiveUserRateLimiter } from '../../../../modules/shared/presentation/middlewares/sensitiveUserRateLimiter';
import * as controller from '../controllers/return.controller';

export const returnRouter = Router();

returnRouter.use(authenticate);

/**
 * @openapi
 * /api/v1/returns:
 *   get:
 *     summary: Listar devoluciones
 *     tags: [Returns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: estado, schema: { type: string, enum: [RECIBIDO, EN_INSPECCION, APROBADO, RECHAZADO, EN_REPARACION, REINGRESADO, DESCARTADO] } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Lista paginada de devoluciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Return' } }
 *                 meta: { $ref: '#/components/schemas/Paginated' }
 *   post:
 *     summary: Crear devolución
 *     tags: [Returns]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cantidad]
 *             properties:
 *               orderId: { type: string }
 *               prenda: { type: string }
 *               referencia: { type: string }
 *               motivo: { type: string }
 *               cantidad: { type: integer }
 *               cantidadInspeccionada: { type: integer }
 *               destino: { type: string, enum: [REINGRESO_INVENTARIO, REPARACION, DESCARTE, DEVOLUCION_PROVEEDOR] }
 *               cliente: { type: string }
 *               responsable: { type: string }
 *               observaciones: { type: string }
 *               fechaDevolucion: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Devolución creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Return' }
 */
returnRouter.get(
  '/',
  requirePermission('orders:read'),
  asyncHandler(controller.listReturns)
);

/**
 * @openapi
 * /api/v1/returns/{id}:
 *   get:
 *     summary: Obtener devolución por ID
 *     tags: [Returns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Devolución encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Return' }
 *       404: { description: No encontrada }
 *   patch:
 *     summary: Actualizar devolución
 *     tags: [Returns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenda: { type: string }
 *               referencia: { type: string }
 *               motivo: { type: string }
 *               cantidad: { type: integer }
 *               cantidadInspeccionada: { type: integer }
 *               estado: { type: string, enum: [RECIBIDO, EN_INSPECCION, APROBADO, RECHAZADO, EN_REPARACION, REINGRESADO, DESCARTADO] }
 *               destino: { type: string, enum: [REINGRESO_INVENTARIO, REPARACION, DESCARTE, DEVOLUCION_PROVEEDOR] }
 *               cliente: { type: string }
 *               responsable: { type: string }
 *               observaciones: { type: string }
 *     responses:
 *       200:
 *         description: Devolución actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Return' }
 *       404: { description: No encontrada }
 *   delete:
 *     summary: Eliminar devolución (soft delete)
 *     tags: [Returns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Eliminada }
 *       404: { description: No encontrada }
 */
returnRouter.get(
  '/:id',
  requirePermission('orders:read'),
  asyncHandler(controller.getReturn)
);

returnRouter.post(
  '/',
  requirePermission('orders:create'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.createReturn)
);

returnRouter.patch(
  '/:id',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.updateReturn)
);

/**
 * @openapi
 * /api/v1/returns/{id}/status:
 *   post:
 *     summary: Cambiar estado de devolución
 *     tags: [Returns]
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
 *               estado: { type: string, enum: [RECIBIDO, EN_INSPECCION, APROBADO, RECHAZADO, EN_REPARACION, REINGRESADO, DESCARTADO] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Return' }
 *       404: { description: No encontrada }
 */
returnRouter.post(
  '/:id/status',
  requirePermission('orders:update'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.changeReturnStatus)
);

returnRouter.delete(
  '/:id',
  requireRole('ADMIN'),
  sensitiveUserRateLimiter,
  asyncHandler(controller.deleteReturn)
);
