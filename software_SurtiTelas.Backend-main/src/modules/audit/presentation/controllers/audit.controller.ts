import { Request, Response } from 'express';
import { ok, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { auditUseCases } from '../../infrastructure/container/auditContainer';
import { AuditLogFiltersSchema, CreateAuditLogSchema, UpdateAuditLogSchema } from '../validators/audit.validators';

export const listAuditLogs = async (req: Request, res: Response) => {
  const filters = parseDto(AuditLogFiltersSchema, req.query);
  const result = await auditUseCases.listAuditLogs.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    req.originalUrl,
    { usuarioId: filters.usuarioId, modulo: filters.modulo, accion: filters.accion, dateFrom: filters.dateFrom, dateTo: filters.dateTo, sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const createAuditLog = async (req: Request, res: Response) => {
  const input = parseDto(CreateAuditLogSchema, req.body);
  const auditLog = await auditUseCases.createAuditLog.execute(input);
  return ok(res, auditLog, 'Registro de auditoría creado');
};

export const getAuditLog = async (req: Request, res: Response) => {
  const auditLog = await auditUseCases.getAuditLog.execute(req.params.id);
  return ok(res, auditLog);
};

export const updateAuditLog = async (req: Request, res: Response) => {
  const input = parseDto(UpdateAuditLogSchema, req.body);
  const auditLog = await auditUseCases.updateAuditLog.execute(req.params.id, input);
  return ok(res, auditLog, 'Registro de auditoría actualizado');
};

export const deleteAuditLog = async (req: Request, res: Response) => {
  await auditUseCases.deleteAuditLog.execute(req.params.id);
  return noContent(res);
};
