import type { ControlPrendaRepository } from '../../domain/repositories/ControlPrendaRepository';

export class GetControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}
