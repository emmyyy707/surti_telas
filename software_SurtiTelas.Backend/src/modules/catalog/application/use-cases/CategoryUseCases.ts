import type { CategoryRepository } from '../../domain/repositories/ProductRepository';

export class CreateCategory {
  constructor(private readonly repo: CategoryRepository) {}
  execute(input: { nombre: string; slug: string; parentId?: string | null }) {
    return this.repo.create(input);
  }
}

export class GetCategories {
  constructor(private readonly repo: CategoryRepository) {}
  execute(filters?: { page?: number; limit?: number }) {
    return this.repo.list(filters);
  }
}

