import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { productionUseCases } from '../../infrastructure/container/productionContainer';
import {
  AssignToWorkshopSchema,
  CompleteProductionSchema,
  CreateProductionOrderSchema,
  CreateControlPrendaSchema,
  ReviewControlPrendaSchema,
  UpdateControlPrendaSchema,
  UpdateProductionOrderSchema,
  CreateWorkshopSchema,
  ProductionOrderFiltersSchema,
  UpdateProgressSchema,
  UpdateWorkshopSchema,
  WorkshopFiltersSchema,
  CreateProductionItemSchema,
  UpdateProductionItemSchema,
  ProductionItemFiltersSchema,
} from '../validators/production.validators';

export const listWorkshops = async (req: Request, res: Response) => {
  const filters = parseDto(WorkshopFiltersSchema, req.query);
  const result = await productionUseCases.getWorkshops.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const createWorkshop = async (req: Request, res: Response) => {
  const input = parseDto(CreateWorkshopSchema, req.body);
  const workshop = await productionUseCases.registerWorkshop.execute({ ...input, usuarioId: req.user!.id });
  return created(res, workshop, 'Taller creado');
};

export const updateWorkshop = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateWorkshopSchema, req.body);
  const workshop = await productionUseCases.updateWorkshop.execute(req.params.id, { ...changes, usuarioId: req.user!.id });
  return ok(res, workshop, 'Taller actualizado');
};

export const deleteWorkshop = async (req: Request, res: Response) => {
  await productionUseCases.deleteWorkshop.execute(req.params.id, req.user!.id);
  return noContent(res);
};

export const getProductionOrderById = async (req: Request, res: Response) => {
  const order = await productionUseCases.getProductionOrderById.execute(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'not_found', message: 'Orden de producción no encontrada' });
  return ok(res, order);
};

export const listProductionOrders = async (req: Request, res: Response) => {
  const filters = parseDto(ProductionOrderFiltersSchema, req.query);
  if (req.user?.role === 'CLIENTE' && !filters.pedidoId) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Debes especificar el pedido para consultar su producción' });
  }
  const result = await productionUseCases.getProductionOrders.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const createProductionOrder = async (req: Request, res: Response) => {
  const input = parseDto(CreateProductionOrderSchema, req.body);
  const estadoMap: Record<string, 'PENDIENTE' | 'ASIGNADA' | 'EN_PROCESO' | 'TERMINADO'> = {
    'Pendiente': 'PENDIENTE',
    'Asignada': 'ASIGNADA',
    'En produccion': 'EN_PROCESO',
    'Completada': 'TERMINADO',
  };
  const order = await productionUseCases.createProductionOrder.execute({
    ...input,
    fechaEstimada: new Date(input.fechaEstimada),
    fechaInicio: input.fechaInicio ? new Date(input.fechaInicio) : undefined,
    estado: input.estado ? estadoMap[input.estado] ?? input.estado : undefined,
    usuarioId: req.user!.id,
  });
  return created(res, order, 'Orden de producción creada');
};

export const assignToWorkshop = async (req: Request, res: Response) => {
  const { tallerId } = parseDto(AssignToWorkshopSchema, req.body);
  const order = await productionUseCases.assignToWorkshop.execute(req.params.id, tallerId, req.user!.id);
  return ok(res, order, 'Taller asignado');
};

export const updateProgress = async (req: Request, res: Response) => {
  const { avance } = parseDto(UpdateProgressSchema, req.body);
  const order = await productionUseCases.updateProgress.execute(req.params.id, avance, req.user!.id);
  return ok(res, order, 'Avance actualizado');
};

export const updateProductionOrder = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateProductionOrderSchema, req.body);
  const estadoMap: Record<string, 'PENDIENTE' | 'ASIGNADA' | 'EN_PROCESO' | 'TERMINADO'> = {
    'Pendiente': 'PENDIENTE',
    'Asignada': 'ASIGNADA',
    'En produccion': 'EN_PROCESO',
    'Completada': 'TERMINADO',
  };
  const order = await productionUseCases.updateProductionOrder.execute(req.params.id, {
    ...changes,
    fechaInicio: changes.fechaInicio ? new Date(changes.fechaInicio) : undefined,
    estado: changes.estado ? estadoMap[changes.estado] ?? changes.estado : undefined,
    usuarioId: req.user!.id,
  });
  return ok(res, order, 'Orden de producción actualizada');
};

export const deleteProductionOrder = async (req: Request, res: Response) => {
  await productionUseCases.deleteProductionOrder.execute(req.params.id, req.user!.id);
  return noContent(res);
};

export const completeProduction = async (req: Request, res: Response) => {
  parseDto(CompleteProductionSchema, req.body);
  const order = await productionUseCases.completeProduction.execute(req.params.id, req.requestId);
  return ok(res, order, 'Producción completada');
};

export const getProductionAlerts = async (_req: Request, res: Response) => {
  const alerts = await productionUseCases.getProductionAlerts.execute();
  return ok(res, alerts);
};

export const createControlPrenda = async (req: Request, res: Response) => {
  const input = parseDto(CreateControlPrendaSchema, req.body);
  const control = await productionUseCases.createControlPrenda.execute({
    ...input,
    creadoPorId: req.user!.id,
    usuarioId: req.user!.id,
  });
  return created(res, control, 'Control de prenda creado');
};

export const reviewControlPrenda = async (req: Request, res: Response) => {
  const { estado } = parseDto(ReviewControlPrendaSchema, req.body);
  const control = await productionUseCases.reviewControlPrenda.execute(req.params.id, {
    estado,
    cantidadAprobada: req.body.cantidadAprobada,
    cantidadRechazada: req.body.cantidadRechazada,
    revisadoPorId: req.user!.id,
    usuarioId: req.user!.id,
  });
  return ok(res, control, estado === 'APROBADO' ? 'Prenda aprobada' : 'Prenda rechazada');
};

export const listControlPrendas = async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const filters = {
    produccionId: req.query.produccionId as string | undefined,
    etapa: req.query.etapa as string | undefined,
    estado: req.query.estado as string | undefined,
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
  };
  const result = await productionUseCases.listControlPrendas.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page ?? 1,
    result.meta.limit ?? 50,
    null
  );
  return ok(res, response);
};

export const updateControlPrenda = async (req: Request, res: Response) => {
  const input = parseDto(UpdateControlPrendaSchema, req.body);
  const control = await productionUseCases.updateControlPrenda.execute(req.params.id, { ...input, usuarioId: req.user!.id });
  return ok(res, control, 'Control de prenda actualizado');
};

export const deleteControlPrenda = async (req: Request, res: Response) => {
  await productionUseCases.deleteControlPrenda.execute(req.params.id, req.user!.id);
  return noContent(res);
};

export const listProductionItems = async (req: Request, res: Response) => {
  const filters = parseDto(ProductionItemFiltersSchema, req.query);
  const result = await productionUseCases.getProductionItems.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getProductionItemById = async (req: Request, res: Response) => {
  const item = await productionUseCases.getProductionItemById.execute(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'not_found', message: 'Item de producción no encontrado' });
  return ok(res, item);
};

export const createProductionItem = async (req: Request, res: Response) => {
  const input = parseDto(CreateProductionItemSchema, req.body);
  const item = await productionUseCases.createProductionItem.execute({
    ...input,
    produccionId: req.params.id,
  });
  return created(res, item, 'Item de producción creado');
};

export const updateProductionItem = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateProductionItemSchema, req.body);
  const item = await productionUseCases.updateProductionItem.execute(req.params.id, changes);
  return ok(res, item, 'Item de producción actualizado');
};

export const deleteProductionItem = async (req: Request, res: Response) => {
  await productionUseCases.deleteProductionItem.execute(req.params.id);
  return noContent(res);
};
