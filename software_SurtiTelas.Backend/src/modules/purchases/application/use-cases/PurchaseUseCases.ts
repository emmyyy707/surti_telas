import { NotFoundError } from '../../../../shared/domain/errors';
import type { PurchaseRepository } from '../../domain/repositories/PurchaseRepository';
import type { CreatePurchaseInput, PurchaseFilters, UpdatePurchaseInput } from '../../domain/repositories/PurchaseRepository';

export class CreatePurchase {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(input: CreatePurchaseInput) {
    return this.repo.create(input);
  }
}

export class GetPurchases {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(filters?: PurchaseFilters) {
    return this.repo.list(filters);
  }
}

export class GetPurchaseById {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}

export class UpdatePurchase {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(id: string, changes: UpdatePurchaseInput) {
    return this.repo.update(id, changes);
  }
}

export class CancelPurchase {
  constructor(private readonly repo: PurchaseRepository) {}
  async execute(id: string, motivo: string) {
    const purchase = await this.repo.getById(id);
    if (!purchase) throw new NotFoundError('Compra no encontrada');
    const cancelled = purchase.cancel(motivo);
    return this.repo.update(id, { estado: cancelled.estado, observaciones: cancelled.observaciones });
  }
}

export class DeletePurchase {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class GetPurchaseItems {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(purchaseId: string) {
    return this.repo.getItems(purchaseId);
  }
}

export class AddPurchaseItem {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(purchaseId: string, item: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }) {
    return this.repo.addItem(purchaseId, item);
  }
}

export class RemovePurchaseItem {
  constructor(private readonly repo: PurchaseRepository) {}
  execute(itemId: string) {
    return this.repo.removeItem(itemId);
  }
}
