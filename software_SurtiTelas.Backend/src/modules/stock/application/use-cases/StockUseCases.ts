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
import {
  StockBelowMinimumEvent,
  SupplierCreatedEvent,
  SupplierUpdatedEvent,
  SupplierDeletedEvent,
  RawMaterialCreatedEvent,
  RawMaterialUpdatedEvent,
  RawMaterialDeletedEvent,
  StockMovementCreatedEvent,
} from '../../../../shared/application/events';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

export class CreateSupplier {
  constructor(private readonly repo: SupplierRepository) {}
  execute(input: CreateSupplierInput & { usuarioId: string }) {
    const supplier = this.repo.create(input);
    eventBus.publish(
      new SupplierCreatedEvent({
        supplierId: (supplier as any).id,
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        usuarioId: input.usuarioId,
      })
    );
    return supplier;
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
  execute(id: string, changes: UpdateSupplierInput & { usuarioId: string }) {
    const { usuarioId, ...rest } = changes;
    const supplier = this.repo.update(id, rest);
    eventBus.publish(
      new SupplierUpdatedEvent({
        supplierId: id,
        nombre: rest.nombre ?? '',
        cambios: rest as unknown as Record<string, unknown>,
        usuarioId,
      })
    );
    return supplier;
  }
}

export class DeleteSupplier {
  constructor(private readonly repo: SupplierRepository) {}
  execute(id: string, usuarioId: string) {
    const supplier = this.repo.getById(id);
    this.repo.delete(id);
    eventBus.publish(
      new SupplierDeletedEvent({
        supplierId: id,
        nombre: (supplier as any)?.nombre ?? '',
        usuarioId,
      })
    );
  }
}

export class CreateRawMaterial {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(input: CreateRawMaterialInput & { usuarioId: string }) {
    const material = this.repo.create(input);
    eventBus.publish(
      new RawMaterialCreatedEvent({
        rawMaterialId: (material as any).id,
        nombre: input.nombre,
        stockActual: input.stockActual ?? 0,
        stockMinimo: input.stockMinimo ?? 0,
        unidadMedida: input.unidadMedida,
        usuarioId: input.usuarioId,
      })
    );
    return material;
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
  execute(id: string, changes: UpdateRawMaterialInput & { usuarioId: string }) {
    const { usuarioId, ...rest } = changes;
    const material = this.repo.update(id, rest);
    eventBus.publish(
      new RawMaterialUpdatedEvent({
        rawMaterialId: id,
        nombre: rest.nombre ?? '',
        cambios: rest as unknown as Record<string, unknown>,
        usuarioId,
      })
    );
    return material;
  }
}

export class DeleteRawMaterial {
  constructor(private readonly repo: RawMaterialRepository) {}
  execute(id: string, usuarioId: string) {
    const material = this.repo.getById(id);
    this.repo.delete(id);
    eventBus.publish(
      new RawMaterialDeletedEvent({
        rawMaterialId: id,
        nombre: (material as any)?.nombre ?? '',
        usuarioId,
      })
    );
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

    const movement = await this.movementRepo.create({
      tipo: input.tipo,
      rawMaterialId: input.rawMaterialId,
      cantidad: input.cantidad,
      ajuste: input.ajuste,
      motivo: input.motivo,
      usuarioId: input.usuarioId,
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new StockMovementCreatedEvent({
          movementId: (movement as any).id,
          rawMaterialId: input.rawMaterialId,
          rawMaterialNombre: rawMaterial.nombre,
          tipo: input.tipo,
          cantidad: input.cantidad,
          nuevoStock: newStock,
          usuarioId: input.usuarioId,
        }, requestId)
      );
    }

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
