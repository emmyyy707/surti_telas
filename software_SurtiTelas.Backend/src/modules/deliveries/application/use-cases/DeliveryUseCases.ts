/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError } from '../../../../shared/domain/errors';
import type { CreateDeliveryInput, DeliveryRepository, UpdateDeliveryInput } from '../../domain/repositories/DeliveryRepository';
import { Delivery } from '../../domain/entities/Delivery';

export class ListDeliveries {
  constructor(private readonly repo: DeliveryRepository) {}
  execute(filters?: { estado?: Delivery['estado']; domiciliarioId?: string; page?: number; limit?: number }) {
    return this.repo.list(filters);
  }
}

export class GetDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string) {
    const delivery = await this.repo.getById(id);
    if (!delivery) throw new NotFoundError('Entrega no encontrada');
    return delivery;
  }
}

export class CreateDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(input: CreateDeliveryInput) {
    const delivery = new Delivery({
      orderId: input.orderId,
      domiciliarioId: input.domiciliarioId ?? null,
      estado: 'ASIGNADO',
      direccion: input.direccion ?? null,
      ciudad: input.ciudad ?? null,
      telefono: input.telefono ?? null,
      notas: input.notas ?? null,
      asignadoEn: new Date(),
    });
    return this.repo.create(delivery as any);
  }
}

export class UpdateDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string, changes: UpdateDeliveryInput) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');
    return this.repo.update(id, changes);
  }
}

export class ChangeDeliveryStatus {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string, estado: Delivery['estado']) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');
    const updated = new Delivery({ ...existing.toDTO(), estado });
    if (estado === 'ENTREGADO') updated.marcarEntregado();
    if (estado === 'EN_RUTA') updated.marcarEnRuta();
    if (estado === 'FALLIDO') updated.marcarFallido();
    return this.repo.update(id, { estado: updated.estado, entregadoEn: updated.entregadoEn });
  }
}

export class DeleteDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');
    return this.repo.delete(id);
  }
}

