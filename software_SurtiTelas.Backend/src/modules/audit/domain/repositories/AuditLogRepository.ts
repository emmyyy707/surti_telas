import type { AuditLog } from '../entities/AuditLog';

export interface AuditLogFilters {
  usuarioId?: string;
  modulo?: string;
  accion?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'createdAt';
  order?: 'asc' | 'desc';
}

export interface CreateAuditLogInput {
  accion: string;
  modulo: string;
  usuarioId?: string;
  referenciaId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: unknown;
}

export interface UpdateAuditLogInput {
  accion?: string;
  modulo?: string;
  referenciaId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}

export interface AuditLogRepository {
  list(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  getById(id: string): Promise<AuditLog | null>;
  update(id: string, data: UpdateAuditLogInput): Promise<AuditLog>;
  delete(id: string): Promise<void>;
}
