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
import { ProductionCompletedEvent, ControlCreatedEvent, ControlUpdatedEvent, ControlDeletedEvent, WorkshopCreatedEvent, WorkshopUpdatedEvent, WorkshopDeletedEvent, ProductionOrderCreatedEvent, ProductionOrderUpdatedEvent, ProductionOrderDeletedEvent, ProductionOrderAssignedEvent, ProductionProgressUpdatedEvent } from '../../../../shared/application/events';

const ETAPA_ORDER = ['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE'] as const;

export class RegisterWorkshop {
  constructor(private readonly repo: WorkshopRepository, private readonly eventBus?: EventBus) {}
  execute(input: CreateWorkshopInput & { usuarioId: string }) {
    const workshop = this.repo.create(input);
    if (this.eventBus) {
      this.eventBus.publish(
        new WorkshopCreatedEvent({
          workshopId: (workshop as any).id,
          nombre: input.nombre,
          ciudad: input.ciudad,
          usuarioId: input.usuarioId,
        })
      );
    }
    return workshop;
  }
}

export class UpdateWorkshop {
  constructor(private readonly repo: WorkshopRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, changes: UpdateWorkshopInput & { usuarioId: string }) {
    const { usuarioId, ...rest } = changes;
    const workshop = this.repo.update(id, rest);
    if (this.eventBus) {
      this.eventBus.publish(
        new WorkshopUpdatedEvent({
          workshopId: id,
          nombre: rest.nombre ?? '',
          cambios: rest as unknown as Record<string, unknown>,
          usuarioId,
        })
      );
    }
    return workshop;
  }
}

export class DeleteWorkshop {
  constructor(private readonly repo: WorkshopRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, usuarioId: string) {
    const workshop = this.repo.getById(id);
    this.repo.delete(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new WorkshopDeletedEvent({
          workshopId: id,
          nombre: (workshop as any)?.nombre ?? '',
          usuarioId,
        })
      );
    }
  }
}

export class GetWorkshops {
  constructor(private readonly repo: WorkshopRepository) {}
  execute(filters?: WorkshopFilters) {
    return this.repo.list(filters);
  }
}

export class CreateProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository, private readonly eventBus?: EventBus) {}
  execute(input: CreateProductionOrderInput & { usuarioId: string }) {
    const order = this.repo.create(input);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionOrderCreatedEvent({
          productionOrderId: (order as any).id,
          referencia: input.referencia,
          cantidad: input.cantidad,
          estado: (order as any).estado ?? 'PENDIENTE',
          tallerId: input.tallerId,
          usuarioId: input.usuarioId,
        })
      );
    }
    return order;
  }
}

export class AssignToWorkshop {
  constructor(private readonly repo: ProductionOrderRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, tallerId: string, usuarioId: string) {
    const order = this.repo.assignToWorkshop(id, tallerId);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionOrderAssignedEvent({
          productionOrderId: id,
          referencia: (order as any).referencia,
          tallerId,
          tallerNombre: (order as any).tallerNombre ?? '',
          usuarioId,
        })
      );
    }
    return order;
  }
}

export class UpdateProgress {
  constructor(private readonly repo: ProductionOrderRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, avance: number, usuarioId: string) {
    const order = this.repo.updateProgress(id, avance);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionProgressUpdatedEvent({
          productionOrderId: id,
          referencia: (order as any).referencia,
          avance,
          usuarioId,
        })
      );
    }
    return order;
  }
}

export class UpdateProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, changes: UpdateProductionOrderInput & { usuarioId: string }) {
    const { usuarioId, ...rest } = changes;
    const order = this.repo.update(id, rest);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionOrderUpdatedEvent({
          productionOrderId: id,
          referencia: (order as any).referencia,
          cambios: rest as unknown as Record<string, unknown>,
          usuarioId,
        })
      );
    }
    return order;
  }
}

export class DeleteProductionOrder {
  constructor(private readonly repo: ProductionOrderRepository, private readonly eventBus?: EventBus) {}
  execute(id: string, usuarioId: string) {
    const order = this.repo.getById(id);
    this.repo.delete(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new ProductionOrderDeletedEvent({
          productionOrderId: id,
          referencia: (order as any)?.referencia ?? '',
          usuarioId,
        })
      );
    }
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
  constructor(private readonly repo: ControlPrendaRepository, private readonly eventBus?: EventBus) {}
  async execute(input: CreateControlPrendaInput & { usuarioId: string }) {
    const control = await this.repo.create(input);
    if (this.eventBus) {
      this.eventBus.publish(
        new ControlCreatedEvent({
          controlId: control.id,
          produccionId: control.produccionId,
          etapa: control.etapa,
          estado: control.estado,
          cantidadTotal: control.cantidadTotal,
          creadoPorId: input.creadoPorId,
        })
      );
    }
    return control;
  }
}

export class ReviewControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, changes: ReviewControlPrendaInput & { usuarioId: string }) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');

    const control = await this.repo.review(id, changes);
    if (this.eventBus) {
      this.eventBus.publish(
        new ControlUpdatedEvent({
          controlId: control.id,
          produccionId: control.produccionId,
          estado: control.estado,
          etapa: existing.etapa,
          creadoPorId: existing.creadoPor.id,
          revisadoPorId: changes.revisadoPorId,
        })
      );
    }

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
  execute(filters: { produccionId?: string; etapa?: string; estado?: string; page?: number; limit?: number } = {}) {
    return this.repo.list(filters);
  }
}

export class UpdateControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, changes: UpdateControlPrendaInput & { usuarioId: string }) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    const control = await this.repo.update(id, changes);
    if (this.eventBus) {
      this.eventBus.publish(
        new ControlUpdatedEvent({
          controlId: control.id,
          produccionId: control.produccionId,
          estado: control.estado,
          etapa: existing.etapa,
          creadoPorId: existing.creadoPor.id,
          revisadoPorId: (changes as any).revisadoPorId,
        })
      );
    }
    return control;
  }
}

export class DeleteControlPrenda {
  constructor(private readonly repo: ControlPrendaRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, usuarioId: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Control de prenda no encontrado');
    await this.repo.delete(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new ControlDeletedEvent({
          controlId: id,
          produccionId: existing.produccionId,
          etapa: existing.etapa,
          usuarioId,
        })
      );
    }
  }
}
