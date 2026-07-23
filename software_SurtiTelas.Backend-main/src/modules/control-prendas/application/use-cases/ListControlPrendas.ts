import type { ControlPrendaFilters, ControlPrendaRepository } from '../../domain/repositories/ControlPrendaRepository';

export class ListControlPrendas {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(filters?: ControlPrendaFilters) {
    return this.repo.list(filters);
  }
}
