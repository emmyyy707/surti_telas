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

export class UpdateCategory {
  constructor(private readonly repo: CategoryRepository) {}
  execute(id: string, input: { nombre?: string; slug?: string; parentId?: string | null }) {
    return this.repo.update(id, input);
  }
}

export class DeleteCategory {
  constructor(private readonly repo: CategoryRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class GetCategoryById {
  constructor(private readonly repo: CategoryRepository) {}
  execute(id: string) {
    return this.repo.findById(id);
  }
}

export class GetCategoriesWithLowStock {
  constructor(private readonly repo: CategoryRepository) {}
  execute() {
    return this.repo.findAllWithLowStockCount();
  }
}

