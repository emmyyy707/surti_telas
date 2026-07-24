import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
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
} from '../validators/production.validators';

export const listWorkshops = async (req: Request, res: Response) => {
  const filters = parseDto(WorkshopFiltersSchema, req.query);
  const result = await productionUseCases.getWorkshops.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    req.originalUrl,
    { search: filters.search, estado: filters.estado, sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const createWorkshop = async (req: Request, res: Response) => {
  const input = parseDto(CreateWorkshopSchema, req.body);
  const workshop = await productionUseCases.registerWorkshop.execute(input);
  return created(res, workshop, 'Taller creado');
};

export const updateWorkshop = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateWorkshopSchema, req.body);
  const workshop = await productionUseCases.updateWorkshop.execute(req.params.id, changes);
  return ok(res, workshop, 'Taller actualizado');
};

export const deleteWorkshop = async (req: Request, res: Response) => {
  await productionUseCases.deleteWorkshop.execute(req.params.id);
  return noContent(res);
};

export const listProductionOrders = async (req: Request, res: Response) => {
  const filters = parseDto(ProductionOrderFiltersSchema, req.query);
  const result = await productionUseCases.getProductionOrders.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    req.originalUrl,
    { estado: filters.estado, tallerId: filters.tallerId, operarioId: filters.operarioId, pedidoId: filters.pedidoId, sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const createProductionOrder = async (req: Request, res: Response) => {
  const input = parseDto(CreateProductionOrderSchema, req.body);
  const order = await productionUseCases.createProductionOrder.execute({
    ...input,
    fechaEstimada: new Date(input.fechaEstimada),
  });
  return created(res, order, 'Orden de producción creada');
};

export const assignToWorkshop = async (req: Request, res: Response) => {
  const { tallerId } = parseDto(AssignToWorkshopSchema, req.body);
  const order = await productionUseCases.assignToWorkshop.execute(req.params.id, tallerId);
  return ok(res, order, 'Taller asignado');
};

export const updateProgress = async (req: Request, res: Response) => {
  const { avance } = parseDto(UpdateProgressSchema, req.body);
  const order = await productionUseCases.updateProgress.execute(req.params.id, avance);
  return ok(res, order, 'Avance actualizado');
};

export const updateProductionOrder = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateProductionOrderSchema, req.body);
  const order = await productionUseCases.updateProductionOrder.execute(req.params.id, changes);
  return ok(res, order, 'Orden de producción actualizada');
};

export const deleteProductionOrder = async (req: Request, res: Response) => {
  await productionUseCases.deleteProductionOrder.execute(req.params.id);
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
  });
  return ok(res, control, 'Control actualizado');
};

export const listControlPrendas = async (req: Request, res: Response) => {
  const filters = {
    produccionId: req.query.produccionId as string | undefined,
    etapa: req.query.etapa as string | undefined,
    estado: req.query.estado as string | undefined,
  };
  const result = await productionUseCases.listControlPrendas.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    1,
    50,
    req.originalUrl,
    filters,
    undefined
  );
  return ok(res, { items: result.data, meta });
};

export const updateControlPrenda = async (req: Request, res: Response) => {
  const input = parseDto(UpdateControlPrendaSchema, req.body);
  const control = await productionUseCases.updateControlPrenda.execute(req.params.id, input);
  return ok(res, control, 'Control de prenda actualizado');
};

export const deleteControlPrenda = async (req: Request, res: Response) => {
  await productionUseCases.deleteControlPrenda.execute(req.params.id);
  return noContent(res);
};
