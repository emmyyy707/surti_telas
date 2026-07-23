import { NotFoundError } from '../../../../shared/domain/errors';
import type {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopFilters,
  WorkshopRepository,
} from '../../domain/repositories/WorkshopRepository';
import type { CreateProductionOrderInput, ProductionOrderFilters, ProductionOrderRepository, UpdateProductionOrderInput } from '../../domain/repositories/ProductionOrderRepository';
import type { ControlPrendaRepository, CreateControlPrendaInput, ReviewControlPrendaInput, UpdateControlPrendaInput } from '../../domain/repositories/ControlPrendaRepository';
import type { EventBus } from '../../../../shared/application/events';
import { ProductionCompletedEvent } from '../../../../shared/application/events';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { ControlCreatedEvent, ControlUpdatedEvent } from '../../../../shared/application/events';

const ETAPA_ORDER = ['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE'] as const;

export class RegisterWorkshop {
  constructor(private readonly repo: WorkshopRepository) {}
  execute(input: CreateWorkshopInput) {
    return this.repo.create(input);
  }
}

export class UpdateWorkshop {
  constructor(private readonly repo: WorkshopRepository) {}
  execute(id: string, changes: UpdateWorkshopInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteWorkshop {
  constructor(private readonly repo: WorkshopRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class GetWorkshops {
  constructor(private readonly repo: WorkshopRepository) {}
  execute(filters?: WorkshopFilters) {
    return this.repo.list(filters);
  }
}

export class CreateProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(input: CreateProductionOrderInput) {
    return this.repo.create(input);
  }
}

export class AssignToWorkshop {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(id: string, tallerId: string) {
    return this.repo.assignToWorkshop(id, tallerId);
  }
}

export class UpdateProgress {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(id: string, avance: number) {
    return this.repo.updateProgress(id, avance);
  }
}

export class UpdateProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(id: string, changes: UpdateProductionOrderInput) {
    return this.repo.update(id, changes);
  }
}

export class DeleteProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class CompleteProduction {
  constructor(
    private readonly repo: ProductionOrderRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, requestId?: string) {
    const order = await this.repo.complete(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionCompletedEvent({
          productionOrderId: order.id!,
          referencia: order.referencia,
          cantidad: order.cantidad,
          tallerId: order.tallerId,
        }, requestId)
      );
    }
    return order;
  }
}

export class GetProductionOrders {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(filters?: ProductionOrderFilters) {
    return this.repo.list(filters);
  }
}

export class GetProductionAlerts {
  constructor(private readonly repo: ProductionOrderRepository) {}
  execute(filters?: ProductionOrderFilters) {
    return this.repo.list({ ...filters, estado: 'PENDIENTE' });
  }
}

export class CreateControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  async execute(input: CreateControlPrendaInput) {
    const control = await this.repo.create(input);
    eventBus.publish(
      new ControlCreatedEvent({
        controlId: control.id,
        produccionId: control.produccionId,
        etapa: control.etapa,
        estado: control.estado,
        cantidadTotal: control.cantidadTotal,
        creadoPorId: input.creadoPorId,
      })
    );
    return control;
  }
}

export class ReviewControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  async execute(id: string, changes: ReviewControlPrendaInput) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');

    const control = await this.repo.review(id, changes);
    eventBus.publish(
      new ControlUpdatedEvent({
        controlId: control.id,
        produccionId: control.produccionId,
        estado: control.estado,
        etapa: existing.etapa,
        creadoPorId: existing.creadoPor.id,
        revisadoPorId: changes.revisadoPorId,
      })
    );

    if (control.estado === 'APROBADO') {
      const currentIndex = ETAPA_ORDER.indexOf(existing.etapa as typeof ETAPA_ORDER[number]);
      if (currentIndex >= 0 && currentIndex < ETAPA_ORDER.length - 1) {
        const nextEtapa = ETAPA_ORDER[currentIndex + 1];
        try {
          const existentes = await this.repo.list({ produccionId: control.produccionId, etapa: nextEtapa });
          if (existentes.data.length === 0) {
            await this.repo.create({
              produccionId: control.produccionId,
              etapa: nextEtapa,
              cantidadTotal: 0,
              creadoPorId: existing.creadoPor.id,
            });
          }
        } catch {
          // noop
        }
      }
    }

    return control;
  }
}

export class ListControlPrendas {
  constructor(private readonly repo: ControlPrendaRepository) {}
  execute(filters: { produccionId?: string; etapa?: string; estado?: string } = {}) {
    return this.repo.list(filters);
  }
}

export class UpdateControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  async execute(id: string, changes: UpdateControlPrendaInput) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    return this.repo.update(id, changes);
  }
}

export class DeleteControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    await this.repo.delete(id);
  }
}
