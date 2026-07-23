/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError } from '../../../../shared/domain/errors';
import type { CreateReturnInput, ReturnRepository, UpdateReturnInput } from '../../domain/repositories/ReturnRepository';
import { Return } from '../../domain/entities/Return';

function generarNumero(seq: number): string {
  return `DEV-${String(seq).padStart(4, '0')}`;
}

export class ListReturns {
  constructor(private readonly repo: ReturnRepository) {}
  execute(filters?: { estado?: Return['estado']; page?: number; limit?: number }) {
    return this.repo.list(filters);
  }
}

export class GetReturn {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(id: string) {
    const ret = await this.repo.getById(id);
    if (!ret) throw new NotFoundError('Devolución no encontrada');
    return ret;
  }
}

export class CreateReturn {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(input: CreateReturnInput) {
    const numero = await this.repo.nextNumero();
    const ret = new Return({
      numeroDevolucion: numero,
      orderId: input.orderId ?? null,
      prenda: input.prenda ?? null,
      referencia: input.referencia ?? null,
      motivo: input.motivo ?? null,
      cantidad: input.cantidad,
      cantidadInspeccionada: input.cantidadInspeccionada ?? 0,
      fechaDevolucion: input.fechaDevolucion ? new Date(input.fechaDevolucion) : new Date(),
      estado: 'RECIBIDO',
      destino: input.destino ?? 'REINGRESO_INVENTARIO',
      cliente: input.cliente ?? null,
      responsable: input.responsable ?? null,
      observaciones: input.observaciones ?? null,
    });
    return this.repo.create(ret as any);
  }
}

export class UpdateReturn {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(id: string, changes: UpdateReturnInput) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    return this.repo.update(id, changes);
  }
}

export class ChangeReturnStatus {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(id: string, estado: Return['estado']) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    return this.repo.update(id, { estado });
  }
}

export class DeleteReturn {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    return this.repo.delete(id);
  }
}

export { generarNumero };

