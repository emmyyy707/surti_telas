import { Request, Response } from 'express';
import { z } from 'zod';
import { created, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { prisma } from '../../../../config/database';
import { customOrderUseCases } from '../../infrastructure/container/customOrderContainer';
import {
  QuotationSchema,
  AcceptQuotationSchema,
  RejectQuotationSchema,
  CustomOrderFiltersSchema,
  CreateCustomOrderSchema,
  UpdateCustomOrderSchema,
} from '../validators/custom-order.validators';
import path from 'path';
import fs from 'fs';

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
          nombre: user.nombre || input.clienteNombre || 'Cliente',
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
          nombre: user.nombre || input.clienteNombre || 'Cliente',
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
  return ok(res, pedido.toDTO());
};

export const updateCustomOrderStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(z.object({ estado: z.enum(['SOLICITUD_RECIBIDA', 'EN_REVISION', 'COTIZADO', 'COTIZACION_ACEPTADA', 'COTIZACION_RECHAZADA', 'PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION', 'PAGO_APROBADO', 'CONVERTIDO_A_PEDIDO', 'EN_PRODUCCION', 'COMPLETADO', 'CANCELADO', 'VENCIDO']) }), req.body);
  if (estado === 'EN_PRODUCCION') {
    const pedido = await customOrderUseCases.getCustomOrder.execute(req.params.id);
    if (!pedido.anticipoPagado) {
      return ok(res, pedido.toDTO(), 'Requiere abono del 50% para pasar a producción');
    }
  }
  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, { estado });
  return ok(res, pedido.toDTO(), 'Estado actualizado');
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

export const rejectQuotation = async (req: Request, res: Response) => {
  const input = parseDto(RejectQuotationSchema, req.body);
  const pedido = await customOrderUseCases.rejectQuotation.execute(req.params.id, input.motivoRechazo);
  return ok(res, pedido.toDTO(), 'Cotización rechazada');
};

export const generateQuotation = async (req: Request, res: Response) => {
  const input = parseDto(QuotationSchema, req.body);
  const result = await customOrderUseCases.generateQuotation.execute(req.params.id, input as any);
  return created(res, { ...result.pedido.toDTO(), cotizacion: result.cotizacion.toDTO() }, 'Cotización generada y enviada al cliente');
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

  const relativePath = `/uploads/custom-orders/payments/${fileName}`;
  return ok(res, { paymentProofUrl: relativePath }, 'Comprobante subido correctamente');
};

export const updatePaymentInfo = async (req: Request, res: Response) => {
  const { paymentKey } = req.body;
  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, {
    paymentKey: paymentKey || undefined,
  });
  return ok(res, pedido.toDTO(), 'Información de pago actualizada');
};

export const updateCustomOrder = async (req: Request, res: Response) => {
  const input = parseDto(UpdateCustomOrderSchema, req.body);
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
          nombre: user.nombre || input.clienteNombre || 'Cliente',
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

  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, payload);
  return ok(res, pedido.toDTO(), 'Solicitud actualizada');
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const input = parseDto(z.object({
    paymentStatus: z.string().optional(),
    anticipoPagado: z.boolean().optional(),
    paymentProofUrl: z.string().url().optional().or(z.literal('')),
    paymentKey: z.string().optional(),
  }), req.body);
  const changes: Record<string, unknown> = {};
  if (input.paymentStatus !== undefined) changes.paymentStatus = input.paymentStatus;
  if (input.anticipoPagado !== undefined) changes.anticipoPagado = input.anticipoPagado;
  if (input.paymentProofUrl !== undefined) changes.paymentProofUrl = input.paymentProofUrl || null;
  if (input.paymentKey !== undefined) changes.paymentKey = input.paymentKey;

  const pedido = await customOrderUseCases.updateCustomOrder.execute(req.params.id, changes);
  return ok(res, pedido.toDTO(), 'Estado de pago actualizado');
};
