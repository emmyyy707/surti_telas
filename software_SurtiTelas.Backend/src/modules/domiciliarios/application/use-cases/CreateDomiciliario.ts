import type { DomiciliarioRepository } from '../../domain/repositories/DomiciliarioRepository';
import type { CreateDomiciliarioInput } from '../../domain/repositories/DomiciliarioRepository';

export class CreateDomiciliario {
  constructor(private readonly repo: DomiciliarioRepository) {}
  execute(data: CreateDomiciliarioInput) {
    return this.repo.create(data);
  }
}
