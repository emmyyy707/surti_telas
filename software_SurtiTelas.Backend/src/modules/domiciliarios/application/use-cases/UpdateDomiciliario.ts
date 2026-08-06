import type { DomiciliarioRepository } from '../../domain/repositories/DomiciliarioRepository';
import type { UpdateDomiciliarioInput } from '../../domain/repositories/DomiciliarioRepository';

export class UpdateDomiciliario {
  constructor(private readonly repo: DomiciliarioRepository) {}
  execute(id: string, changes: UpdateDomiciliarioInput) {
    return this.repo.update(id, changes);
  }
}
