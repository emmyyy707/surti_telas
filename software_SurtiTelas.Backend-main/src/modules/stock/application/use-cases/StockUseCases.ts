import { NotFoundError } from '../../../../shared/domain/errors';
import type {
  CreateSupplierInput,
  SupplierFilters,
  SupplierRepository,
  UpdateSupplierInput,
} from '../../domain/repositories/SupplierRepository';
import type {
  CreateRawMaterialInput,
  RawMaterialFilters,
  RawMaterialRepository,
  UpdateRawMaterialInput,
} from '../../domain/repositories/RawMaterialRepository';
import type {
  MovementFilters,
  InventoryMovementRepository,
} from '../../domain/repositories/InventoryMovementRepository';
import type { EventBus } from '../../../../shared/application/events';
import { StockBelowMinimumEvent } from '../../../../shared/application/events';

export class CreateSupplier {
  constructor(private readonly repo: SupplierRepository) {}
  execute(input: CreateSupplierInput) {
    return this.repo.create(input);
  }
}

export class GetSuppliers {
  constructor(private readonly repo: SupplierRepository) {}
  execute(filters?: SupplierFilters) {
    return this.repo.list(filters);
  }
}

export class GetSupplierById {
  constructor(private readonly repo: SupplierRepository) {}
  execute(id: string) {
    return this.repo.getById(id);
  }
}

export class UpdateSupplier {
  constructor(private readonly repo: SupplierRepository) {}
  execute(id: string, changes: UpdateSupplierInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteSupplier {
  constructor(private readonly repo: SupplierRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class CreateRawMaterial {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(input: CreateRawMaterialInput) {
    return this.repo.create(input);
  }
}

export class GetRawMaterials {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(filters?: RawMaterialFilters) {
    return this.repo.list(filters);
  }
}

export class UpdateRawMaterial {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(id: string, changes: UpdateRawMaterialInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteRawMaterial {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class RegisterMovement {
  constructor(
    private readonly rawMaterialRepo: RawMaterialRepository,
    private readonly movementRepo: InventoryMovementRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(input: { rawMaterialId: string; tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'; cantidad: number; motivo: string; usuarioId: string; ajuste?: number }, requestId?: string) {
    const rawMaterial = await this.rawMaterialRepo.getById(input.rawMaterialId);
    if (!rawMaterial) throw new NotFoundError('Insumo no encontrado');

    let newStock = rawMaterial.stockActual;
    if (input.tipo === 'ENTRADA') newStock += input.cantidad;
    else if (input.tipo === 'SALIDA') newStock = Math.max(0, newStock - input.cantidad);
    else if (input.tipo === 'AJUSTE') newStock = Math.max(0, input.ajuste ?? newStock);

    const updated = await this.rawMaterialRepo.update(input.rawMaterialId, { stockActual: newStock });

    await this.movementRepo.create({
      tipo: input.tipo,
      rawMaterialId: input.rawMaterialId,
      cantidad: input.cantidad,
      ajuste: input.ajuste,
      motivo: input.motivo,
      usuarioId: input.usuarioId,
    });

    if (updated.necesitaReposicion() && this.eventBus) {
      this.eventBus.publish(
        new StockBelowMinimumEvent({
          rawMaterialId: updated.id!,
          rawMaterialNombre: updated.nombre,
          stockActual: updated.stockActual,
          stockMinimo: updated.stockMinimo,
        }, requestId)
      );
    }

    return updated;
  }
}

export class GetMovements {
  constructor(private readonly repo: InventoryMovementRepository) {}
  execute(filters?: MovementFilters) {
    return this.repo.list(filters);
  }
}

export class GetStockAlerts {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(filters?: RawMaterialFilters) {
    return this.repo.list({ ...filters, necesitaReposicion: true });
  }
}
