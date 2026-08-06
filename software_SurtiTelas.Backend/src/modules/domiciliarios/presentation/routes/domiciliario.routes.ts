import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/domiciliario.controller';

/**
 * @swagger
 * /domiciliarios:
 *   get:
 *     tags: [Domiciliarios]
 *     summary: Lista domiciliarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zona
 *         schema:
 *           type: string
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de domiciliarios
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
export const domiciliarioRouter = Router();

domiciliarioRouter.use(authenticate);

domiciliarioRouter.get('/', requirePermission('domiciliarios:read'), asyncHandler(controller.listDomiciliarios));

/**
 * @swagger
 * /domiciliarios/{id}:
 *   get:
 *     tags: [Domiciliarios]
 *     summary: Obtiene un domiciliario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domiciliario encontrado
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
domiciliarioRouter.get('/:id', requirePermission('domiciliarios:read'), asyncHandler(controller.getDomiciliario));

/**
 * @swagger
 * /domiciliarios:
 *   post:
 *     tags: [Domiciliarios]
 *     summary: Crea un domiciliario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDomiciliario'
 *     responses:
 *       201:
 *         description: Domiciliario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domiciliario'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
domiciliarioRouter.post('/', requirePermission('domiciliarios:create'), asyncHandler(controller.createDomiciliario));

/**
 * @swagger
 * /domiciliarios/{id}:
 *   patch:
 *     tags: [Domiciliarios]
 *     summary: Actualiza un domiciliario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDomiciliario'
 *     responses:
 *       200:
 *         description: Domiciliario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domiciliario'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
domiciliarioRouter.patch('/:id', requirePermission('domiciliarios:update'), asyncHandler(controller.updateDomiciliario));
