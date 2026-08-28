import { Request, Response } from 'express';
import { z } from 'zod';
import { created, ok, badRequest } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { prisma } from '../../../../config/database';
import { customOrderUseCases } from '../../infrastructure/container/customOrderContainer';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { CustomOrderReferenceUploadedEvent, CustomOrderPaymentUpdatedEvent } from '../../../../shared/application/events';
import {
  QuotationSchema,
  AcceptQuotationSchema,
  AcceptQuotationDecisionsSchema,
  RejectQuotationSchema,
  StartNegotiationSchema,
  RespondToNegotiationSchema,
  RejectNegotiationSchema,
  CustomOrderFiltersSchema,
  CreateCustomOrderSchema,
  UpdateCustomOrderSchemaBase,
} from '../validators/custom-order.validators';
import { isAllowedStatusTransition } from '../../domain/value-objects/CustomOrderStatusTransitions';
import path, { extname } from 'path';
import fs from 'fs';
import { randomUUID } from 'node:crypto';

const STATUS_TRANSITION_PERMISSION: Record<string, string> = {
  PENDIENTE_TO_ACEPTADO: 'customOrders:transition:pendiente_to_aceptado',
  PENDIENTE_TO_CANCELADO: 'customOrders:transition:pendiente_to_cancelado',
  COTIZADO_TO_COTIZACION_ACEPTADA: 'customOrders:transition:cotizado_to_cotizacion_aceptada',
  COTIZADO_TO_COTIZACION_RECHAZADA: 'customOrders:transition:cotizado_to_cotizacion_rechazada',
  PAGO_APROBADO_TO_EN_PRODUCCION: 'customOrders:transition:pago_aprobado_to_en_produccion',
};

const getTransitionPermissionKey = (currentStatus: string, newStatus: string): string | null => {
  const key = `${currentStatus}_TO_${newStatus}`;
  return STATUS_TRANSITION_PERMISSION[key] || null;
};

const hasPermission = (user: any, permission: string): boolean => {
  if (!user || !Array.isArray(user.permissions)) return false;
  if (user.role === 'ADMIN') return true;
  return user.permissions.includes(permission) || user.permissions.includes('customOrders:transition');
};

const PAYMENT_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'custom-orders', 'payments');

if (!fs.existsSync(PAYMENT_UPLOAD_DIR)) {
  fs.mkdirSync(PAYMENT_UPLOAD_DIR, { recursive: true });
}

export const createCustomOrder = async (req: Request, res: Response) => {
  const input = parseDto(CreateCustomOrderSchema, req.body);
  const user = (req as any).user;
  let clienteId = input.clienteId;

  if (user?.role === 'CLIENTE') {
    const customer = await prisma.customer.findFirst({
      where: { email: user.email, deletedAt: null },
    });
    if (customer) {
      clienteId = customer.id;
    } else {
      const createdCustomer = await prisma.customer.create({
        data: {
          nombre: user.nombre || 'Cliente',
          email: user.email || null,
          telefono: null,
          ciudad: null,
          nit: null,
          cupoTotal: 0,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: false,
          estado: 'ACTIVO',
        },
      });
      clienteId = createdCustomer.id;
    }
  } else if (!clienteId && user?.id) {
    const customer = await prisma.customer.findFirst({
      where: { email: user.email, deletedAt: null },
    });
    if (customer) {
      clienteId = customer.id;
    } else {
      const createdCustomer = await prisma.customer.create({
        data: {
          nombre: user.nombre || 'Cliente',
          email: user.email || null,
          telefono: null,
          ciudad: null,
          nit: null,
          cupoTotal: 0,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: false,
          estado: 'ACTIVO',
        },
      });
      clienteId = createdCustomer.id;
    }
  }

  const payload: any = {
    ...input,
    clienteId,
  };
  if (input.asesorId) payload.asesorId = input.asesorId;

  const pedido = await customOrderUseCases.createCustomOrder.execute(payload);
  return created(res, pedido.toDTO(), 'Solicitud de pedido personalizado creada');
};

export const listCustomOrders = async (req: Request, res: Response) => {
  const filters = parseDto(CustomOrderFiltersSchema, req.query);
  const user = (req as any).user;
  if (user?.role === 'CLIENTE') {
    const customer = await prisma.customer.findFirst({
      where: { email: user.email, deletedAt: null },
      select: { id: true },
    });
    if (customer) {
      filters.clienteId = customer.id;
    } else {
      filters.clienteId = '__no_customer__';
    }
  }
  const result = await customOrderUseCases.listCustomOrders.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data.map((item) => item.toDTO()),
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getCustomOrder = async (req: Request, res: Response) => {
  const pedido = await customOrderUseCases.getCustomOrder.execute(req.params.id);
  console.log('[backend][getCustomOrder] id', req.params.id, 'usoFinal', pedido.usoFinal, 'direccionEntrega', pedido.direccionEntrega, 'itemsCount', pedido.items?.length, 'firstItemKeys', pedido.items?.[0] ? Object.keys(pedido.items[0]) : []);
  console.log('[backend][getCustomOrder] firstItem', pedido.items?.[0]);
  return ok(res, pedido.toDTO());
};

export const updateCustomOrderStatus = async (req: Request, res: Response) => {
    const { estado } = parseDto(z.object({ estado: z.enum(['PENDIENTE', 'ACEPTADO', 'CANCELADO', 'SOLICITUD_RECIBIDA', 'COTIZACION_ACEPTADA', 'COTIZACION_RECHAZADA', 'PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION', 'PAGO_APROBADO', 'CONVERTIDO_A_PEDIDO', 'EN_PRODUCCION', 'COMPLETADO', 'VENCIDO']) }), req.body);
   const pedido = await customOrderUseCases.getCustomOrder.execute(req.params.id);
   if (!isAllowedStatusTransition(pedido.estado, estado)) {
     return ok(res, pedido.toDTO(), `No se puede cambiar el estado desde ${pedido.estado} a ${estado}`);
   }

   const user = (req as any).user;
   const requiredPermission = getTransitionPermissionKey(pedido.estado, estado);
   if (requiredPermission && !hasPermission(user, requiredPermission)) {
     return ok(res, pedido.toDTO(), 'No tienes permiso para realizar esta transición de estado');
   }

   if (estado === 'EN_PRODUCCION') {
     if (!pedido.anticipoPagado) {
       return ok(res, pedido.toDTO(), 'Requiere abono del 50% para pasar a producción');
     }
   }
   const updated = await customOrderUseCases.changeCustomOrderStatus.execute(req.params.id, estado, req.user?.id);
   return ok(res, updated.toDTO(), 'Estado actualizado');
 };

export const submitForReview = async (req: Request, res: Response) => {
  const pedido = await customOrderUseCases.submitForReview.execute(req.params.id);
  return ok(res, pedido.toDTO(), 'Solicitud enviada a revisión');
};

export const acceptQuotation = async (req: Request, res: Response) => {
  parseDto(AcceptQuotationSchema, req.body);
  const pedido = await customOrderUseCases.acceptQuotation.execute(req.params.id);
  return ok(res, pedido.toDTO(), 'Cotización aceptada. Se generará tu pedido.');
};

export const acceptQuotationWithDecisions = async (req: Request, res: Response) => {
  const input = parseDto(AcceptQuotationDecisionsSchema, req.body);
  const result = await customOrderUseCases.acceptQuotationWithDecisions.execute(req.params.id, {
    acceptedIds: input.acceptedIds,
    rejectedItems: input.rejectedItems,
  });
  return ok(res, result, 'Selección de cotización procesada correctamente');
};

export const rejectQuotation = async (req: Request, res: Response) => {
  const input = parseDto(RejectQuotationSchema, req.body);
  const pedido = await customOrderUseCases.rejectQuotation.execute(req.params.id, input.motivoRechazo, req.user?.email);
  return ok(res, pedido.toDTO(), 'Cotización rechazada');
};

export const startNegotiation = async (req: Request, res: Response) => {
  const input = parseDto(StartNegotiationSchema, req.body);
  const result = await customOrderUseCases.startNegotiation.execute(
    req.params.id,
    req.user?.id ?? '',
    req.user?.role ?? 'CLIENTE',
    input.message,
    input.proposalData
  );
  return created(res, result, 'Negociación iniciada');
};

export const respondToNegotiation = async (req: Request, res: Response) => {
  const input = parseDto(RespondToNegotiationSchema, req.body);
  const result = await customOrderUseCases.respondToNegotiation.execute(
    req.params.id,
    req.user?.id ?? '',
    req.user?.role ?? 'CLIENTE',
    input.message,
    input.proposalData,
    req.body.parentId
  );
  return created(res, result, 'Respuesta enviada');
};

export const acceptNegotiationProposal = async (req: Request, res: Response) => {
  const { negotiationId } = req.body as { negotiationId: string };
  if (!negotiationId) {
    return badRequest(res, 'negotiationId es requerido');
  }
  const result = await customOrderUseCases.acceptNegotiationProposal.execute(
    req.params.id,
    negotiationId,
    req.user?.id ?? ''
  );
  return ok(res, result, 'Propuesta aceptada');
};

export const rejectNegotiationProposal = async (req: Request, res: Response) => {
  const input = parseDto(RejectNegotiationSchema, req.body);
  const result = await customOrderUseCases.rejectNegotiationProposal.execute(
    req.params.id,
    input.negotiationId,
    req.user?.id ?? '',
    input.reason
  );
  return ok(res, result, 'Propuesta rechazada');
};

export const getNegotiationHistory = async (req: Request, res: Response) => {
  const pedido = await customOrderUseCases.getCustomOrder.execute(req.params.id);
  if (!pedido) {
    return ok(res, []);
  }
  const quoteId = (pedido as any).cotizacion?.id;
  if (!quoteId) {
    return ok(res, []);
  }
  const history = await customOrderUseCases.getNegotiationHistory.execute(quoteId);
  return ok(res, history, 'Historial de negociación');
};

export const sendQuotation = async (req: Request, res: Response) => {
  const pedido = await customOrderUseCases.sendQuotation.execute(req.params.id, req.user?.id);
  return ok(res, pedido.toDTO(), 'Cotización enviada al cliente');
};

export const generateQuotation = async (req: Request, res: Response) => {
  const input = parseDto(QuotationSchema, req.body);
  const result = await customOrderUseCases.generateQuotation.execute(req.params.id, input as any);
  return created(res, { pedido: result.pedido.toDTO(), cotizacion: result.cotizacion.toDTO() }, input.draft ? 'Cotización guardada como borrador' : 'Cotización generada y enviada al cliente');
};

export const convertToOrder = async (req: Request, res: Response) => {
  const result = await customOrderUseCases.convertToOrder.execute(req.params.id, req.user?.id);
  return ok(res, result, 'Pedido normal creado exitosamente');
};

export const uploadPaymentProof = async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return ok(res, { message: 'No se recibió archivo' }, 'Error al subir comprobante');
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(PAYMENT_UPLOAD_DIR, fileName);
  fs.copyFileSync(file.path, filePath);

  const relativePath = fileName;
  return ok(res, { paymentProofUrl: relativePath }, 'Comprobante subido correctamente');
};

export const servePaymentProof = async (req: Request, res: Response): Promise<void> => {
  const order = await customOrderUseCases.getCustomOrder.execute(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Solicitud no encontrada' }) as any;
  }

  const stored = order.paymentProofUrl;
  if (!stored) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Comprobante de pago no encontrado' }) as any;
  }

  let fileName: string;
  if (stored.startsWith('/uploads/custom-orders/payments/')) {
    fileName = path.basename(stored);
  } else {
    fileName = stored;
  }

  const resolved = path.join(PAYMENT_UPLOAD_DIR, fileName);
  const allowedBase = PAYMENT_UPLOAD_DIR;

  if (!resolved.startsWith(allowedBase + path.sep) && resolved !== allowedBase) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Ruta de archivo inválida' }) as any;
  }

  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Archivo no encontrado' }) as any;
  }

  const mimeType = extname(resolved).toLowerCase() === '.pdf' ? 'application/pdf' : 'image/jpeg';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  return new Promise((resolve, reject) => {
    fs.createReadStream(resolved).pipe(res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
};

export const uploadReferenceImage = async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return ok(res, { message: 'No se recibió archivo' }, 'Error al subir imagen');
  }

  const referenceUploadDir = path.resolve(process.cwd(), 'uploads', 'custom-orders', 'references');
  if (!fs.existsSync(referenceUploadDir)) {
    fs.mkdirSync(referenceUploadDir, { recursive: true });
  }

  const originalName = (file.originalname || '').trim();
  const ext = path.extname(originalName).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const safeExt = allowedExtensions.includes(ext) ? ext : '.bin';

  const fileName = `${randomUUID()}${safeExt}`;
  const filePath = path.join(referenceUploadDir, fileName);

  const normalizedPath = path.normalize(filePath);
  const normalizedDir = path.normalize(referenceUploadDir);
  if (!normalizedPath.startsWith(normalizedDir + path.sep)) {
    return ok(res, { message: 'Ruta de archivo inválida' }, 'Error al subir imagen');
  }

  fs.copyFileSync(file.path, filePath);

  const relativePath = `/uploads/custom-orders/references/${fileName}`;

  const customOrder = await prisma.custom_orders.findFirst({
    where: { id: req.params.id, deleted_at: null },
    select: { id: true, numero: true, cliente_id: true, cliente_nombre: true, asesor_id: true },
  });

  if (customOrder) {
    eventBus.publish(
      new CustomOrderReferenceUploadedEvent({
        customOrderId: customOrder.id,
        numeroSolicitud: customOrder.numero,
        clienteId: customOrder.cliente_id,
        clienteNombre: customOrder.cliente_nombre ?? '',
        asesorId: customOrder.asesor_id ?? undefined,
        asesorNombre: undefined,
      }, req.requestId)
    );
  }

  return ok(res, { url: relativePath }, 'Imagen de referencia subida correctamente');
};

export const updatePaymentInfo = async (req: Request, res: Response) => {
  const { paymentKey } = req.body;
  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, {
    paymentKey: paymentKey || undefined,
  }, req.requestId);
  return ok(res, pedido.toDTO(), 'Información de pago actualizada');
};

export const updateCustomOrder = async (req: Request, res: Response) => {
  const input = parseDto(UpdateCustomOrderSchemaBase, req.body);
  const user = (req as any).user;
  let clienteId = input.clienteId;

  if (user?.role === 'CLIENTE') {
    const customer = await prisma.customer.findFirst({
      where: { email: user.email, deletedAt: null },
    });
    if (customer) {
      clienteId = customer.id;
    } else {
      const createdCustomer = await prisma.customer.create({
        data: {
          nombre: user.nombre || 'Cliente',
          email: user.email || null,
          telefono: null,
          ciudad: null,
          nit: null,
          cupoTotal: 0,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: false,
          estado: 'ACTIVO',
        },
      });
      clienteId = createdCustomer.id;
    }
  }

  const payload: any = {
    ...input,
    clienteId,
  };

  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, payload, req.requestId);
  return ok(res, pedido.toDTO(), 'Solicitud actualizada');
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const input = parseDto(z.object({
    paymentStatus: z.string().optional(),
    anticipoPagado: z.boolean().optional(),
    paymentProofUrl: z.string().optional().or(z.literal('')),
    paymentKey: z.string().optional(),
  }), req.body);
  const changes: Record<string, unknown> = {};
  if (input.paymentStatus !== undefined) changes.paymentStatus = input.paymentStatus;
  if (input.anticipoPagado !== undefined) changes.anticipoPagado = input.anticipoPagado;
  if (input.paymentProofUrl !== undefined) changes.paymentProofUrl = input.paymentProofUrl || null;
  if (input.paymentKey !== undefined) changes.paymentKey = input.paymentKey;

  const isConfirmingPayment = input.anticipoPagado === true || input.paymentStatus === 'APPROVED';

  let pedido: any;
  if (isConfirmingPayment) {
    pedido = await customOrderUseCases.confirmPaymentAndConvertToOrder.execute(req.params.id, {
      paymentStatus: input.paymentStatus,
      anticipoPagado: input.anticipoPagado,
      paymentProofUrl: input.paymentProofUrl,
      paymentKey: input.paymentKey,
    });
  } else {
    pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, changes, req.requestId);
  }

  const customOrder = await prisma.custom_orders.findFirst({
    where: { id: req.params.id, deleted_at: null },
    select: { id: true, numero: true, cliente_id: true, cliente_nombre: true, asesor_id: true },
  });

  if (customOrder) {
    eventBus.publish(
      new CustomOrderPaymentUpdatedEvent({
        customOrderId: customOrder.id,
        numeroSolicitud: customOrder.numero,
        cambios: changes,
        clienteId: customOrder.cliente_id,
        clienteNombre: customOrder.cliente_nombre ?? '',
        asesorId: customOrder.asesor_id ?? undefined,
        asesorNombre: undefined,
      }, req.requestId)
    );
  }

  return ok(res, pedido.toDTO(), isConfirmingPayment ? 'Anticipo confirmado y pedido convertido a producción' : 'Estado de pago actualizado');
};

export const removeCustomOrder = async (req: Request, res: Response) => {
  await customOrderUseCases.deleteCustomOrder.execute(req.params.id, req.requestId);
  return ok(res, { id: req.params.id }, 'Solicitud eliminada');
};

export const getCustomOrderHistory = async (req: Request, res: Response) => {
  const history = await customOrderUseCases.getCustomOrderHistory.execute(req.params.id);
  return ok(res, history);
};

export const getCustomOrderMetrics = async (_req: Request, res: Response) => {
  const metrics = await customOrderUseCases.getCustomOrderMetrics.execute();
  return ok(res, metrics);
};
