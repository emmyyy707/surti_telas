import type { CreateProductionItemInput, ProductionItemFilters, ProductionItemRepository, UpdateProductionItemInput } from '../../domain/repositories/ProductionItemRepository';

export class CreateProductionItem {
  constructor(private readonly repo: ProductionItemRepository) {}
  execute(input: CreateProductionItemInput) {
    return this.repo.create(input);
  }
}

export class UpdateProductionItem {
  constructor(private readonly repo: ProductionItemRepository) {}
  execute(id: string, changes: UpdateProductionItemInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteProductionItem {
  constructor(private readonly repo: ProductionItemRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class GetProductionItems {
  constructor(private readonly repo: ProductionItemRepository) {}
  execute(filters?: ProductionItemFilters) {
    return this.repo.list(filters);
  }
}

export class GetProductionItemById {
  constructor(private readonly repo: ProductionItemRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}
