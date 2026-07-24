import { NotFoundError } from '../../../../shared/domain/errors';
import type { AlertRepository } from '../../domain/repositories/AlertRepository';

export class UpdateAlert {
  constructor(private readonly repo: AlertRepository) {}
  async execute(id: string, changes: Parameters<AlertRepository['update']>[1]) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Alerta no encontrada');
    return this.repo.update(id, changes);
  }
}
