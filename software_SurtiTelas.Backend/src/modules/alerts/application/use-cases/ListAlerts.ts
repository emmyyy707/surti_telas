import type { AlertFilters, AlertRepository } from '../../domain/repositories/AlertRepository';

export class ListAlerts {
  constructor(private readonly repo: AlertRepository) {}
  execute(filters?: AlertFilters) {
    return this.repo.list(filters);
  }
}
