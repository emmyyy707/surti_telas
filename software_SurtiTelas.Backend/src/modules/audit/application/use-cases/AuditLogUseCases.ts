import { NotFoundError } from '../../../../shared/domain/errors';
import type { AuditLogFilters, CreateAuditLogInput, AuditLogRepository, UpdateAuditLogInput } from '../../domain/repositories/AuditLogRepository';

export class ListAuditLogs {
  constructor(private readonly repo: AuditLogRepository) {}
  execute(filters?: AuditLogFilters) {
    return this.repo.list(filters);
  }
}

export class CreateAuditLog {
  constructor(private readonly repo: AuditLogRepository) {}
  execute(data: CreateAuditLogInput) {
    return this.repo.create(data);
  }
}

export class GetAuditLog {
  constructor(private readonly repo: AuditLogRepository) {}
  async execute(id: string) {
    const log = await this.repo.getById(id);
    if (!log) throw new NotFoundError('Registro de auditoría no encontrado');
    return log;
  }
}

export class UpdateAuditLog {
  constructor(private readonly repo: AuditLogRepository) {}
  execute(id: string, data: UpdateAuditLogInput) {
    return this.repo.update(id, data);
  }
}

export class DeleteAuditLog {
  constructor(private readonly repo: AuditLogRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
