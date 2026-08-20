import type { CustomOrderHistoryRepository } from '../../domain/repositories/CustomOrderRepository';

export class RecordCustomOrderStatusChange {
  constructor(private readonly repo: CustomOrderHistoryRepository) {}

  async execute(data: {
    customOrderId: string;
    usuarioId?: string;
    accion: string;
    estadoAnterior: string;
    estadoNuevo: string;
    razon?: string;
    informacion?: any;
  }) {
    return this.repo.create(data);
  }
}

export class GetCustomOrderHistory {
  constructor(private readonly repo: CustomOrderHistoryRepository) {}

  async execute(customOrderId: string) {
    const history = await this.repo.findByCustomOrderId(customOrderId);
    if (!history || history.length === 0) {
      return [];
    }
    return history;
  }
}
