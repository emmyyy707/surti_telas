import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { alertUseCases } from '../../infrastructure/container/alertContainer';
import { AlertFiltersSchema, CreateAlertSchema } from '../validators/alert.validators';

export const listAlerts = async (req: Request, res: Response) => {
  const filters = parseDto(AlertFiltersSchema, req.query);
  const result = await alertUseCases.listAlerts.execute(filters);
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

export const getAlert = async (req: Request, res: Response) => {
  const alert = await alertUseCases.getAlert.execute(req.params.id);
  return ok(res, alert);
};

export const createAlert = async (req: Request, res: Response) => {
  const input = parseDto(CreateAlertSchema, req.body);
  const alert = await alertUseCases.createAlert.execute(input);
  return created(res, alert, 'Alerta creada');
};

export const markAsRead = async (req: Request, res: Response) => {
  const alert = await alertUseCases.updateAlert.execute(req.params.id, {
    leida: true,
    leidaPorId: req.user!.id,
    estado: 'LEIDA',
  });
  return ok(res, alert, 'Alerta marcada como leída');
};

export const markAsResolved = async (req: Request, res: Response) => {
  const alert = await alertUseCases.updateAlert.execute(req.params.id, {
    resueltaPorId: req.user!.id,
    resueltaEn: new Date(),
    estado: 'RESUELTA',
  });
  return ok(res, alert, 'Alerta marcada como resuelta');
};
