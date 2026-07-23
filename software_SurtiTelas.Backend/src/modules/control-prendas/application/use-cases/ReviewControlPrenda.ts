import type { ControlPrendaRepository } from '../../domain/repositories/ControlPrendaRepository';
import type { ControlPrendaEstado } from '../../domain/entities/ControlPrenda';

export class ReviewControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(id: string, estado: ControlPrendaEstado, revisadoPorId: string, observaciones?: string) {
    return this.repo.review(id, estado, revisadoPorId, observaciones);
  }
}
