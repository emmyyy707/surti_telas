import type { RawMaterialCategoryRepository } from '../../domain/repositories/RawMaterialCategoryRepository';
import type { CreateRawMaterialCategoryInput, RawMaterialCategoryFilters, UpdateRawMaterialCategoryInput } from '../../domain/repositories/RawMaterialCategoryRepository';

export class CreateRawMaterialCategory {
  constructor(private readonly repo: RawMaterialCategoryRepository) {}
  execute(input: CreateRawMaterialCategoryInput) {
    return this.repo.create(input);
  }
}

export class GetRawMaterialCategories {
  constructor(private readonly repo: RawMaterialCategoryRepository) {}
  execute(filters?: RawMaterialCategoryFilters) {
    return this.repo.list(filters);
  }
}

export class GetRawMaterialCategoryById {
  constructor(private readonly repo: RawMaterialCategoryRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}

export class UpdateRawMaterialCategory {
  constructor(private readonly repo: RawMaterialCategoryRepository) {}
  execute(id: string, changes: UpdateRawMaterialCategoryInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteRawMaterialCategory {
  constructor(private readonly repo: RawMaterialCategoryRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
