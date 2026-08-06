import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/cms.controller';

/**
 * @swagger
 * /cms:
 *   get:
 *     tags: [CMS]
 *     summary: Lista páginas CMS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
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
 *         description: Lista de páginas CMS
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
export const cmsRoutes = Router();

cmsRoutes.use(authenticate);

cmsRoutes.get('/', asyncHandler(controller.listCmsPages));

/**
 * @swagger
 * /cms/{id}:
 *   get:
 *     tags: [CMS]
 *     summary: Obtiene una página CMS por ID
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
 *         description: Página CMS encontrada
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
cmsRoutes.get('/:id', asyncHandler(controller.getCmsPage));

/**
 * @swagger
 * /cms:
 *   post:
 *     tags: [CMS]
 *     summary: Crea una página CMS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCmsPage'
 *     responses:
 *       201:
 *         description: Página CMS creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CmsPage'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
cmsRoutes.post('/', requirePermission('cms:update'), asyncHandler(controller.createCmsPage));

/**
 * @swagger
 * /cms/{id}:
 *   patch:
 *     tags: [CMS]
 *     summary: Actualiza una página CMS
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
 *             $ref: '#/components/schemas/UpdateCmsPage'
 *     responses:
 *       200:
 *         description: Página CMS actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CmsPage'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
cmsRoutes.patch('/:id', requirePermission('cms:update'), asyncHandler(controller.updateCmsPage));
