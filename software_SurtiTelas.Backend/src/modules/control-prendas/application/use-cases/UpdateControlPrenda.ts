import type { ControlPrendaRepository } from '../../domain/repositories/ControlPrendaRepository';
import type { UpdateControlPrendaInput } from '../../domain/repositories/ControlPrendaRepository';

export class UpdateControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(id: string, changes: UpdateControlPrendaInput) {
    return this.repo.update(id, changes);
  }
}
