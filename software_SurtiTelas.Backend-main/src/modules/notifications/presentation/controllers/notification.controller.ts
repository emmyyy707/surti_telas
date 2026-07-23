import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { notificationUseCases } from '../../infrastructure/container/notificationContainer';
import { NotificationFiltersSchema, CreateNotificationSchema, UpdateNotificationSchema } from '../validators/notification.validators';

export const getNotifications = async (req: Request, res: Response) => {
  const filters = parseDto(NotificationFiltersSchema, req.query);
  const result = await notificationUseCases.getNotifications.execute({ ...filters, usuarioId: req.user!.id });
  const page = result.meta.page ?? 1;
  const meta = buildPaginationMeta(
    result.meta.total,
    page,
    result.meta.limit,
    req.originalUrl,
    { leida: String(filters.leida), sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const markAsRead = async (req: Request, res: Response) => {
  const notification = await notificationUseCases.markAsRead.execute(req.params.id);
  return ok(res, notification, 'Notificación marcada como leída');
};

export const getNotificationById = async (req: Request, res: Response) => {
  const notification = await notificationUseCases.getNotificationById.execute(req.params.id);
  return ok(res, notification);
};

export const createNotification = async (req: Request, res: Response) => {
  const input = parseDto(CreateNotificationSchema, req.body);
  const notification = await notificationUseCases.createNotification.execute(input);
  return created(res, notification, 'Notificación creada');
};

export const updateNotification = async (req: Request, res: Response) => {
  const input = parseDto(UpdateNotificationSchema, req.body);
  const notification = await notificationUseCases.updateNotification.execute(req.params.id, input);
  return ok(res, notification, 'Notificación actualizada');
};

export const deleteNotification = async (req: Request, res: Response) => {
  await notificationUseCases.deleteNotification.execute(req.params.id);
  return noContent(res);
};
