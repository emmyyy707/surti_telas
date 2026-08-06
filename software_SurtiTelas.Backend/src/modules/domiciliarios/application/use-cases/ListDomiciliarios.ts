import type { DomiciliarioRepository } from '../../domain/repositories/DomiciliarioRepository';
import type { DomiciliarioFilters } from '../../domain/repositories/DomiciliarioRepository';

export class ListDomiciliarios {
  constructor(private readonly repo: DomiciliarioRepository) {}
  execute(filters?: DomiciliarioFilters) {
    return this.repo.list(filters);
  }
}
