import { Request, Response } from 'express';
import { BadRequestError, ForbiddenError } from '../../../../shared/domain/errors';
import { created, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { orderUseCases } from '../../infrastructure/container/orderContainer';
import { canView, canUpdateStatus } from '../../application/policies/orderPolicy';
import { AssignDomiciliarioSchema, CreateOrderSchema, OrderFiltersSchema, UpdateOrderFullSchema, UpdateOrderStatusSchema } from '../validators/order.validators';

export const getOrders = async (req: Request, res: Response) => {
  const filters = parseDto(OrderFiltersSchema, req.query);
  if (req.user?.role === 'ASESOR') {
    filters.asesorId = req.user.id;
  } else if (req.user?.role === 'CLIENTE') {
    filters.clienteId = req.user.id;
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
  filters.clienteId = req.user!.id;
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

export const getOrderById = async (req: Request, res: Response) => {
  const order = await orderUseCases.getOrderById.execute(req.params.id);
  if (!canView(order, req.user!)) {
    throw new ForbiddenError('No tienes acceso a este pedido');
  }
  const hateoas = buildHateoasLinks('/api/v1/orders', order.id);
  return ok(res, { ...order, _links: hateoas });
};

export const createOrder = async (req: Request, res: Response) => {
  const input = parseDto(CreateOrderSchema, req.body);
  const asesorId = req.user!.role === 'ASESOR' ? req.user!.id : input.asesorId;
  if (!asesorId) {
    throw new BadRequestError('Se requiere asesorId para crear el pedido');
  }
  const order = await orderUseCases.createOrder.execute({ ...input, asesorId }, req.requestId);
  return created(res, order, 'Pedido creado');
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
  const order = await orderUseCases.assignDomiciliario.execute(req.params.id, domiciliarioId);
  return ok(res, order, 'Domiciliario asignado');
};

export const updateOrderFull = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateOrderFullSchema, req.body);
  const order = await orderUseCases.updateOrderFull.execute(req.params.id, changes);
  return ok(res, order, 'Pedido actualizado');
};

export const deleteOrder = async (req: Request, res: Response) => {
  await orderUseCases.deleteOrder.execute(req.params.id);
  return res.status(204).send();
};

export const getDashboardMetrics = async (_req: Request, res: Response) => {
  const metrics = await orderUseCases.getDashboardMetrics.execute();
  return ok(res, metrics);
};
