import type { DomiciliarioRepository } from '../../domain/repositories/DomiciliarioRepository';

export class GetDomiciliario {
  constructor(private readonly repo: DomiciliarioRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}
