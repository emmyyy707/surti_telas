import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requirePermission } from '../../../auth/presentation/middlewares/authorize';
import * as controller from '../controllers/employee.controller';

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Empleados]
 *     summary: Lista empleados (Asesor y Domiciliario)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ASESOR, DOMICILIARIO]
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *       - in: query
 *         name: search
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
 *         description: Lista paginada de empleados
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
export const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get('/', requirePermission('employees:read'), asyncHandler(controller.listEmployees));

/**
 * @swagger
 * /employees/search:
 *   get:
 *     tags: [Empleados]
 *     summary: Busca empleados por nombre, email o documento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
employeeRouter.get('/search', requirePermission('employees:read'), asyncHandler(controller.searchEmployees));

/**
 * @swagger
 * /employees/roles:
 *   get:
 *     tags: [Empleados]
 *     summary: Lista roles disponibles dinámicamente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles disponibles
 */
employeeRouter.get('/roles', requirePermission('employees:read'), asyncHandler(controller.listAvailableRoles));

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Empleados]
 *     summary: Obtiene un empleado por ID
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
 *         description: Empleado encontrado
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
employeeRouter.get('/:id', requirePermission('employees:read'), asyncHandler(controller.getEmployee));

/**
 * @swagger
 * /employees:
 *   post:
 *     tags: [Empleados]
 *     summary: Crea un nuevo empleado (Asesor o Domiciliario)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nombre
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ASESOR, DOMICILIARIO]
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               tipoDocumento:
 *                 type: string
 *               numeroDocumento:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   cargo:
 *                     type: string
 *                   fechaContratacion:
 *                     type: string
 *                     format: date
 *                   salario:
 *                     type: number
 *                   tipoEmpleado:
 *                     type: string
 *                     enum: [ASESOR, DOMICILIARIO]
 *     responses:
 *       201:
 *         description: Empleado creado
 */
employeeRouter.post('/', requirePermission('employees:create'), asyncHandler(controller.createEmployee));

/**
 * @swagger
 * /employees/{id}:
 *   patch:
 *     tags: [Empleados]
 *     summary: Actualiza un empleado
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
 *             type: object
 *     responses:
 *       200:
 *         description: Empleado actualizado
 */
employeeRouter.patch('/:id', requirePermission('employees:update'), asyncHandler(controller.updateEmployee));

/**
 * @swagger
 * /employees/{id}/status:
 *   patch:
 *     tags: [Empleados]
 *     summary: Cambia el estado del empleado (activo/inactivo)
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
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
employeeRouter.patch('/:id/status', requirePermission('employees:update'), asyncHandler(controller.changeEmployeeStatus));

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Empleados]
 *     summary: Elimina un empleado (borrado lógico)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Empleado eliminado
 */
employeeRouter.delete('/:id', requirePermission('employees:delete'), asyncHandler(controller.deleteEmployee));
