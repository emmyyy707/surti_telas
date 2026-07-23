import { prisma } from '../../../../config/database';
import { PrismaAuditLogRepository } from '../repositories/PrismaAuditLogRepository';
import { CreateAuditLog, ListAuditLogs, GetAuditLog, UpdateAuditLog, DeleteAuditLog } from '../../application/use-cases/AuditLogUseCases';

const auditLogRepository = new PrismaAuditLogRepository(prisma);

export const auditUseCases = {
  listAuditLogs: new ListAuditLogs(auditLogRepository),
  createAuditLog: new CreateAuditLog(auditLogRepository),
  getAuditLog: new GetAuditLog(auditLogRepository),
  updateAuditLog: new UpdateAuditLog(auditLogRepository),
  deleteAuditLog: new DeleteAuditLog(auditLogRepository),
};
