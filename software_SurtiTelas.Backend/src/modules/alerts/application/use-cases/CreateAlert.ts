import type { AlertRepository } from '../../domain/repositories/AlertRepository';

export class CreateAlert {
  constructor(private readonly repo: AlertRepository) {}
  execute(data: Parameters<AlertRepository['create']>[0]) {
    return this.repo.create(data);
  }
}
