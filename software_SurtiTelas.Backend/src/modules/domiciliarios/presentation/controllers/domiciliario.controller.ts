import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { domiciliarioUseCases } from '../../infrastructure/container/domiciliarioContainer';
import { DomiciliarioFiltersSchema, CreateDomiciliarioSchema, UpdateDomiciliarioSchema } from '../validators/domiciliario.validators';

export const listDomiciliarios = async (req: Request, res: Response) => {
  const filters = parseDto(DomiciliarioFiltersSchema, req.query);
  const result = await domiciliarioUseCases.listDomiciliarios.execute(filters);
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

export const getDomiciliario = async (req: Request, res: Response) => {
  const domiciliario = await domiciliarioUseCases.getDomiciliario.execute(req.params.id);
  return ok(res, domiciliario);
};

export const createDomiciliario = async (req: Request, res: Response) => {
  const input = parseDto(CreateDomiciliarioSchema, req.body);
  const domiciliario = await domiciliarioUseCases.createDomiciliario.execute(input);
  return created(res, domiciliario, 'Domiciliario creado');
};

export const updateDomiciliario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const changes = parseDto(UpdateDomiciliarioSchema, req.body);
  const domiciliario = await domiciliarioUseCases.updateDomiciliario.execute(id, changes);
  return ok(res, domiciliario, 'Domiciliario actualizado');
};
