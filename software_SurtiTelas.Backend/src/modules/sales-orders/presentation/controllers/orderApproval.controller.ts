import { Request, Response } from 'express';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../../shared/domain/errors';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { salesOrderUseCases } from '../../infrastructure/container/salesOrderContainer';
import {
  canViewOrder,
  canUploadPaymentProof,
  canStartValidation,
  canAcceptOrder,
  canRejectOrder,
  canRetryReceipt,
  canViewSalesReport,
} from '../../application/policies/orderApprovalPolicy';

export const uploadPaymentProof = async (req: Request, res: Response) => {
  const order = await salesOrderUseCases.getOrderById(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  if (!canViewOrder(order, req.user!)) throw new ForbiddenError('No tienes acceso a este pedido');
  if (!canUploadPaymentProof(order, req.user!)) throw new ForbiddenError('No puedes cargar comprobantes para este pedido');

  const file = req.file;
  if (!file) {
    throw new BadRequestError('Debe adjuntar un archivo de comprobante de pago');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/payment-proofs/${file.filename}`;

  const updated = await salesOrderUseCases.uploadPaymentProof.execute(req.params.id, {
    url,
    nombreOriginal: file.originalname,
    mime: file.mimetype,
    tamaño: file.size,
    cargadoPorId: req.user!.id,
    estado: 'PENDIENTE_VALIDACION',
  }, req.requestId);

  return ok(res, updated, 'Comprobante cargado');
};

export const startValidation = async (req: Request, res: Response) => {
  const order = await salesOrderUseCases.getOrderById(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  if (!canStartValidation(order, req.user!)) throw new ForbiddenError('No tienes permiso para iniciar validación');

  const updated = await salesOrderUseCases.startValidation.execute(req.params.id, req.user!.id, req.requestId);
  return ok(res, updated, 'Validación iniciada');
};

export const acceptOrder = async (req: Request, res: Response) => {
  const order = await salesOrderUseCases.getOrderById(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  if (!canAcceptOrder(order, req.user!)) throw new ForbiddenError('No tienes permiso para aceptar este pedido');

  const { medioPago } = req.body as { medioPago?: string };
  const updated = await salesOrderUseCases.acceptOrder.execute(req.params.id, { usuarioId: req.user!.id, medioPago }, req.requestId);
  return ok(res, updated, 'Pedido aceptado');
};

export const rejectOrder = async (req: Request, res: Response) => {
  const order = await salesOrderUseCases.getOrderById(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  if (!canRejectOrder(order, req.user!)) throw new ForbiddenError('No tienes permiso para rechazar este pedido');

  const { razon, observaciones } = req.body as { razon: string; observaciones?: string };
  const updated = await salesOrderUseCases.rejectOrder.execute(req.params.id, { usuarioId: req.user!.id, razon, observaciones }, req.requestId);
  return ok(res, updated, 'Pedido rechazado');
};

export const retryReceipt = async (req: Request, res: Response) => {
  const order = await salesOrderUseCases.getOrderById(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  if (!canRetryReceipt(order, req.user!)) throw new ForbiddenError('No tienes permiso para reintentar el envío');

  const updated = await salesOrderUseCases.retryReceiptDelivery.execute(req.params.id, req.user!.id, req.requestId);
  return ok(res, updated, 'Reintento de envío programado');
};

export const getSalesReport = async (req: Request, res: Response) => {
  if (!canViewSalesReport(req.user!)) throw new ForbiddenError('No tienes permiso para ver reportes');

  const { asesorId, clienteId, desde, hasta } = req.query as Record<string, string | undefined>;
  const report = await salesOrderUseCases.getSalesReport.execute({ asesorId, clienteId, desde, hasta });
  return ok(res, report);
};
