import { Request, Response } from 'express';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../../shared/domain/errors';
import { created, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { orderUseCases } from '../../infrastructure/container/orderContainer';
import { canView, canUpdateStatus } from '../../application/policies/orderPolicy';
import { OrderFiltersSchema, CreateOrderSchema, UpdateOrderFullSchema, UpdateOrderStatusSchema, CancelOrderSchema, AssignDomiciliarioSchema } from '../validators/order.validators';
import { prisma } from '../../../../config/database';

const resolveCustomerIdFromUser = async (req: Request): Promise<string | undefined> => {
  const user = req.user;
  if (!user || user.role !== 'CLIENTE') return undefined;
  let customer = await prisma.customer.findFirst({
    where: { email: user.email, deletedAt: null },
    select: { id: true },
  });
  if (!customer) {
    const asesor = await prisma.user.findFirst({
      where: { role: 'ASESOR', deletedAt: null },
      select: { id: true },
    });
    const created = await prisma.customer.create({
      data: {
        nombre: user.nombre ?? user.email,
        email: user.email,
        telefono: null,
        ciudad: null,
        nit: null,
        asesorId: asesor?.id ?? null,
        cupoTotal: 1000000,
        cupoUsado: 0,
        deudaVencida: 0,
        isTrustedCustomer: false,
        estado: 'ACTIVO',
      },
      select: { id: true },
    });
    customer = created;
  }
  return customer?.id;
};

const normalizeCreateOrderBody = (req: Request) => {
  const body = { ...req.body };
  if (typeof body.itemsList === 'string') {
    try {
      body.itemsList = JSON.parse(body.itemsList);
    } catch {
      body.itemsList = [];
    }
  }
  if (body.itemsList && !Array.isArray(body.itemsList)) {
    body.itemsList = [];
  }
  if (body.clienteId === '') delete body.clienteId;
  if (body.asesorId === '') delete body.asesorId;
  if (req.file) {
    body.comprobantePagoUrl = `/uploads/${req.file.filename}`;
  }
  return body;
};

export const getOrders = async (req: Request, res: Response) => {
  const filters = parseDto(OrderFiltersSchema, req.query);
  if (req.user?.role === 'ASESOR') {
    filters.asesorId = req.user.id;
  } else if (req.user?.role === 'CLIENTE') {
    const customerId = await resolveCustomerIdFromUser(req);
    if (customerId) {
      filters.clienteId = customerId;
    } else {
      filters.clienteId = req.user.id;
    }
  } else if (req.user?.role === 'DOMICILIARIO') {
    filters.domiciliarioId = req.user.id;
  }
  const result = await orderUseCases.getOrders.execute(filters);
  const page = result.meta.page ?? 1;
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getOrdersMe = async (req: Request, res: Response) => {
  const filters = parseDto(OrderFiltersSchema, req.query);
  const customerId = await resolveCustomerIdFromUser(req);
  filters.clienteId = customerId ?? req.user!.id;
  const result = await orderUseCases.getOrders.execute(filters);
  console.log('ORDERS_ME_CONTROLLER_TOTAL', result.meta.total, 'clienteId', filters.clienteId);
  const page = result.meta.page ?? 1;
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await orderUseCases.getOrderById.execute(req.params.id);
  if (!canView(order, req.user!)) {
    throw new ForbiddenError('No tienes acceso a este pedido');
  }
  const hateoas = buildHateoasLinks('/api/v1/orders', order.id);
  return ok(res, { ...order, _links: hateoas });
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const normalizedBody = normalizeCreateOrderBody(req);
    const input = parseDto(CreateOrderSchema, normalizedBody);
    console.log('CREATE_ORDER_INPUT', JSON.stringify({ input, user: req.user }));
    let asesorId = req.user!.role === 'ASESOR' ? req.user!.id : input.asesorId;

    if (!asesorId) {
      asesorId = req.user!.id;
    }

    if (!asesorId) {
      throw new BadRequestError('Se requiere asesorId para crear el pedido');
    }

    const order = await orderUseCases.createOrder.execute(
      { ...input, clienteId: req.user?.role === 'CLIENTE' ? undefined : input.clienteId, asesorId },
      req.requestId,
      req.user ? { id: req.user.id, email: req.user.email, nombre: req.user.nombre, role: req.user.role } : undefined,
    );
    console.log('CREATE_ORDER_RESULT', JSON.stringify({ orderId: order.id, clienteId: order.clienteId, clienteNombre: order.cliente }));
    return created(res, order, 'Pedido creado');
  } catch (error) {
    console.error('CREATE_ORDER_CONTROLLER_ERROR', error);
    throw error;
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(UpdateOrderStatusSchema, req.body);
  const existing = await orderUseCases.getOrderById.execute(req.params.id);
  if (!canUpdateStatus(existing, req.user!)) {
    throw new ForbiddenError('No tienes acceso a este pedido');
  }
  const order = await orderUseCases.updateOrderStatus.execute(req.params.id, estado, req.requestId);
  return ok(res, order, 'Estado de pedido actualizado');
};

export const assignDomiciliario = async (req: Request, res: Response) => {
  const { domiciliarioId } = parseDto(AssignDomiciliarioSchema, req.body);
  const domiciliario = await prisma.user.findFirst({ where: { id: domiciliarioId, deletedAt: null }, select: { nombre: true } });
  const order = await orderUseCases.assignDomiciliario.execute(req.params.id, domiciliarioId, (domiciliario as any)?.nombre ?? '', req.requestId);
  return ok(res, order, 'Domiciliario asignado');
};

export const updateOrderFull = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateOrderFullSchema, req.body);
  const order = await orderUseCases.updateOrderFull.execute(req.params.id, changes, req.requestId);
  return ok(res, order, 'Pedido actualizado');
};

export const deleteOrder = async (req: Request, res: Response) => {
  await orderUseCases.deleteOrder.execute(req.params.id, req.requestId);
  return res.status(204).send();
};

export const getDashboardMetrics = async (_req: Request, res: Response) => {
  const metrics = await orderUseCases.getDashboardMetrics.execute();
  return ok(res, metrics);
};

export const approveOrder = async (req: Request, res: Response) => {
  const { usuarioValidacionId } = parseDto(z.object({ usuarioValidacionId: z.string() }), req.body);
  const order = await orderUseCases.approveOrder.execute(req.params.id, usuarioValidacionId, req.requestId);
  return ok(res, order, 'Pedido aprobado');
};

export const rejectOrder = async (req: Request, res: Response) => {
  const body = parseDto(z.object({ usuarioValidacionId: z.string(), razonRechazo: z.string(), observacionesRechazo: z.string().optional() }), req.body);
  const order = await orderUseCases.rejectOrder.execute(req.params.id, body.usuarioValidacionId, body.razonRechazo, body.observacionesRechazo, req.requestId);
  return ok(res, order, 'Pedido rechazado');
};

export const uploadPaymentProof = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('Se requiere el comprobante de pago');
  }
  const order = await orderUseCases.uploadPaymentProof.execute(req.params.id, {
    url: `/uploads/${req.file.filename}`,
    nombreOriginal: req.file.originalname,
    mime: req.file.mimetype,
    tamaño: req.file.size,
    cargadoPorId: req.user!.id,
    estado: 'CARGADO',
    observaciones: req.body.observaciones,
  }, req.requestId);
  return ok(res, order, 'Comprobante cargado');
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { motivoAnulacion } = parseDto(CancelOrderSchema, req.body);
  const order = await orderUseCases.cancelOrder.execute(req.params.id, motivoAnulacion, req.requestId);
  return ok(res, order, 'Pedido cancelado');
};

export const getOrderByNumero = async (req: Request, res: Response) => {
  const order = await orderUseCases.getOrderById.execute(req.params.id);
  if (!order) throw new NotFoundError('Pedido no encontrado');
  return ok(res, order);
};
