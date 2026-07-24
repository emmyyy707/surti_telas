import { Request, Response } from 'express';
import { z } from 'zod';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { clearCache } from '../../../../modules/shared/presentation/middlewares/cache';
import { returnsUseCases } from '../../infrastructure/container/returnsContainer';
import {
  CreateReturnSchema,
  ReturnFiltersSchema,
  ReturnStatusEnum,
  UpdateReturnSchema,
} from '../validators/return.validators';

export const listReturns = async (req: Request, res: Response) => {
  const filters = parseDto(ReturnFiltersSchema, req.query);
  const result = await returnsUseCases.listReturns.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    req.originalUrl,
    { estado: filters.estado },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const getReturn = async (req: Request, res: Response) => {
  const ret = await returnsUseCases.getReturn.execute(req.params.id);
  const links = buildHateoasLinks('/api/v1/returns', ret.id);
  return ok(res, { ...ret.toDTO(), _links: links });
};

export const createReturn = async (req: Request, res: Response) => {
  const input = parseDto(CreateReturnSchema, req.body);
  const ret = await returnsUseCases.createReturn.execute(input);
  clearCache('/api/v1/returns');
  return created(res, ret.toDTO(), 'Devolución creada');
};

export const updateReturn = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateReturnSchema, req.body);
  const ret = await returnsUseCases.updateReturn.execute(req.params.id, changes);
  clearCache('/api/v1/returns');
  return ok(res, ret.toDTO(), 'Devolución actualizada');
};

export const changeReturnStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(z.object({ estado: ReturnStatusEnum }), req.body);
  const ret = await returnsUseCases.changeReturnStatus.execute(req.params.id, estado);
  clearCache('/api/v1/returns');
  return ok(res, ret.toDTO(), 'Estado de devolución actualizado');
};

export const deleteReturn = async (req: Request, res: Response) => {
  await returnsUseCases.deleteReturn.execute(req.params.id);
  clearCache('/api/v1/returns');
  return noContent(res);
};
