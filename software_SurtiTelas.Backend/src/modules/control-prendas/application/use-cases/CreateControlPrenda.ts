import type { ControlPrendaRepository } from '../../domain/repositories/ControlPrendaRepository';
import type { CreateControlPrendaInput } from '../../domain/repositories/ControlPrendaRepository';

export class CreateControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(input: CreateControlPrendaInput) {
    return this.repo.create(input);
  }
}
