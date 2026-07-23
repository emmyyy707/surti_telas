import type { Alert, AlertPriority, AlertState, AlertType } from '../entities/Alert';

export interface AlertFilters {
  estado?: AlertState;
  modulo?: string;
  prioridad?: AlertPriority;
  leida?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'createdAt' | 'prioridad' | 'estado';
  order?: 'asc' | 'desc';
}

export interface CreateAlertInput {
  tipo: AlertType;
  modulo: string;
  referenciaId?: string;
  mensaje: string;
  prioridad?: AlertPriority;
  metadata?: Record<string, unknown>;
  estado?: AlertState;
}

export interface UpdateAlertInput {
  estado?: AlertState;
  prioridad?: AlertPriority;
  leida?: boolean;
  leidaPorId?: string;
  resueltaPorId?: string;
  resueltaEn?: Date;
  metadata?: Record<string, unknown>;
}

export interface AlertRepository {
  list(filters?: AlertFilters): Promise<{ data: Alert[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Alert | null>;
  create(data: CreateAlertInput): Promise<Alert>;
  update(id: string, changes: UpdateAlertInput): Promise<Alert>;
}
