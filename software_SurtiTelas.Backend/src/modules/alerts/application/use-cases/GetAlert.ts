import { NotFoundError } from '../../../../shared/domain/errors';
import type { AlertRepository } from '../../domain/repositories/AlertRepository';

export class GetAlert {
  constructor(private readonly repo: AlertRepository) {}
  async execute(id: string) {
    const alert = await this.repo.getById(id);
    if (!alert) throw new NotFoundError('Alerta no encontrada');
    return alert;
  }
}
