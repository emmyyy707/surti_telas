import { prisma } from '../../../../config/database';
import { PrismaNotificationRepository } from '../repositories/PrismaNotificationRepository';
import { NotificationSubscriber } from '../../application/use-cases/NotificationUseCases';
import { GetNotificationById, GetNotifications, MarkNotificationAsRead, CreateNotification, UpdateNotification, DeleteNotification } from '../../application/use-cases/NotificationUseCases';

const notificationRepository = new PrismaNotificationRepository(prisma);

export const notificationUseCases = {
  getNotifications: new GetNotifications(notificationRepository),
  getNotificationById: new GetNotificationById(notificationRepository),
  markAsRead: new MarkNotificationAsRead(notificationRepository),
  createNotification: new CreateNotification(notificationRepository),
  updateNotification: new UpdateNotification(notificationRepository),
  deleteNotification: new DeleteNotification(notificationRepository),
};

export const notificationSubscriber = new NotificationSubscriber(notificationRepository);
