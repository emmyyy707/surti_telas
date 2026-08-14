import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/errors';
import { customOrderUseCases } from '../../infrastructure/container/customOrderContainer';
import * as controller from '../controllers/custom-order.controller';
import { customOrderUpload } from '../middlewares/custom-order-upload';
import { prisma } from '../../../../config/database';

export const customOrderRouter = Router();

customOrderRouter.use(authenticate);

const wrap = (fn: any) => asyncHandler((req: any, res: any, next: any) => fn(req, res, next));

export async function loadCustomOrder(req: any, _res: any, next: any) {
  try {
    const pedido = await customOrderUseCases.getCustomOrder.execute(req.params.id);
    req.order = pedido;
    next();
  } catch (error) {
    next(error);
  }
}

export async function authorizeCustomOrderAccess(req: any, _res: any, next: any) {
  const order = req.order;
  if (!order) {
    throw new NotFoundError('Solicitud no encontrada');
  }
  if (req.user?.role === 'ADMIN') return next();

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { nombre: { contains: req.user?.name || '', mode: 'insensitive' } },
        { email: { contains: req.user?.email || '', mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  });

  if (!customer || order.clienteId !== customer.id) {
    throw new ForbiddenError('No tienes acceso a esta solicitud');
  }
  next();
}

customOrderRouter.get('/', wrap(controller.listCustomOrders));
customOrderRouter.post('/', wrap(controller.createCustomOrder));
customOrderRouter.get('/:id', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.getCustomOrder));
customOrderRouter.patch('/:id', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.updateCustomOrder));
customOrderRouter.patch('/:id/submit', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.submitForReview));
customOrderRouter.patch('/:id/accept-quotation', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.acceptQuotation));
customOrderRouter.patch('/:id/reject-quotation', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.rejectQuotation));
customOrderRouter.post('/:id/convert', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.convertToOrder));
customOrderRouter.post('/:id/payment-proof', loadCustomOrder, authorizeCustomOrderAccess, customOrderUpload.single('paymentProof'), wrap(controller.uploadPaymentProof));
customOrderRouter.patch('/:id/payment', loadCustomOrder, authorizeCustomOrderAccess, wrap(controller.updatePaymentStatus));
