import { Request, Response } from 'express';
import { z } from 'zod';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { clearCache } from '../../../../modules/shared/presentation/middlewares/cache';
import { deliveriesUseCases } from '../../infrastructure/container/deliveriesContainer';
import {
  CreateDeliverySchema,
  DeliveryFiltersSchema,
  UpdateDeliverySchema,
} from '../validators/delivery.validators';
import { DeliveryStatusEnum } from '../validators/delivery.validators';

export const listDeliveries = async (req: Request, res: Response) => {
  const filters = parseDto(DeliveryFiltersSchema, req.query);
  if (req.user?.role === 'DOMICILIARIO') {
    filters.domiciliarioId = req.user.id;
  }
  const result = await deliveriesUseCases.listDeliveries.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    req.originalUrl,
    { estado: filters.estado, domiciliarioId: filters.domiciliarioId },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const getDelivery = async (req: Request, res: Response) => {
  const delivery = await deliveriesUseCases.getDelivery.execute(req.params.id);
  const links = buildHateoasLinks('/api/v1/deliveries', delivery.id);
  return ok(res, { ...delivery.toDTO(), _links: links });
};

export const createDelivery = async (req: Request, res: Response) => {
  const input = parseDto(CreateDeliverySchema, req.body);
  const delivery = await deliveriesUseCases.createDelivery.execute(input);
  clearCache('/api/v1/deliveries');
  return created(res, delivery.toDTO(), 'Entrega creada');
};

export const updateDelivery = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateDeliverySchema, req.body);
  const delivery = await deliveriesUseCases.updateDelivery.execute(req.params.id, changes);
  clearCache('/api/v1/deliveries');
  return ok(res, delivery.toDTO(), 'Entrega actualizada');
};

export const changeDeliveryStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(z.object({ estado: DeliveryStatusEnum }), req.body);
  const delivery = await deliveriesUseCases.changeDeliveryStatus.execute(req.params.id, estado);
  clearCache('/api/v1/deliveries');
  return ok(res, delivery.toDTO(), 'Estado de entrega actualizado');
};

export const deleteDelivery = async (req: Request, res: Response) => {
  await deliveriesUseCases.deleteDelivery.execute(req.params.id);
  clearCache('/api/v1/deliveries');
  return noContent(res);
};
