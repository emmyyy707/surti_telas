import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { controlPrendaUseCases } from '../../infrastructure/container/controlPrendaContainer';
import {
  ControlPrendaFiltersSchema,
  CreateControlPrendaSchema,
  ReviewControlPrendaSchema,
  UpdateControlPrendaSchema,
} from '../validators/controlPrenda.validators';

export const listControlPrendas = async (req: Request, res: Response) => {
  const filters = parseDto(ControlPrendaFiltersSchema, req.query);
  const result = await controlPrendaUseCases.listControlPrendas.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    req.originalUrl,
    { produccionId: filters.produccionId, etapa: filters.etapa, estado: filters.estado, sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const getControlPrenda = async (req: Request, res: Response) => {
  const control = await controlPrendaUseCases.getControlPrenda.execute(req.params.id);
  return ok(res, control);
};

export const createControlPrenda = async (req: Request, res: Response) => {
  const input = parseDto(CreateControlPrendaSchema, req.body);
  const control = await controlPrendaUseCases.createControlPrenda.execute({
    ...input,
    creadoPorId: req.user!.id,
  });
  return created(res, control, 'Control de prenda creado');
};

export const updateControlPrenda = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateControlPrendaSchema, req.body);
  const control = await controlPrendaUseCases.updateControlPrenda.execute(req.params.id, changes);
  return ok(res, control, 'Control de prenda actualizado');
};

export const reviewControlPrenda = async (req: Request, res: Response) => {
  const { estado, observaciones } = parseDto(ReviewControlPrendaSchema, req.body);
  const control = await controlPrendaUseCases.reviewControlPrenda.execute(req.params.id, estado, req.user!.id, observaciones);
  return ok(res, control, estado === 'APROBADO' ? 'Prenda aprobada' : 'Prenda rechazada');
};
