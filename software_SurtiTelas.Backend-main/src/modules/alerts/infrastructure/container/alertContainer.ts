import { prisma } from '../../../../config/database';
import { PrismaAlertRepository } from '../repositories/PrismaAlertRepository';
import { ListAlerts } from '../../application/use-cases/ListAlerts';
import { GetAlert } from '../../application/use-cases/GetAlert';
import { CreateAlert } from '../../application/use-cases/CreateAlert';
import { UpdateAlert } from '../../application/use-cases/UpdateAlert';

const alertRepository = new PrismaAlertRepository(prisma);

export const alertUseCases = {
  listAlerts: new ListAlerts(alertRepository),
  getAlert: new GetAlert(alertRepository),
  createAlert: new CreateAlert(alertRepository),
  updateAlert: new UpdateAlert(alertRepository),
};
