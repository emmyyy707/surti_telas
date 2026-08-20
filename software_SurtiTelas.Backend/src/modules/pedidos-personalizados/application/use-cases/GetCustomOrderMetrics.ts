import type { CustomOrderRepository } from '../../domain/repositories/CustomOrderRepository';

export type CustomOrderMetrics = {
  total: number;
  pendientes: number;
  aceptados: number;
  cancelados: number;
  tasaAceptacion: number;
  tasaCancelacion: number;
  promedioHorasPorEstado: Record<string, number>;
};

export class GetCustomOrderMetrics {
  constructor(private readonly repo: CustomOrderRepository) {}

  async execute(): Promise<CustomOrderMetrics> {
    const [all, pendientes, aceptados, cancelados] = await Promise.all([
      this.repo.list({ limit: 1000 }),
      this.repo.list({ estado: 'PENDIENTE', limit: 1 }),
      this.repo.list({ estado: 'ACEPTADO', limit: 1 }),
      this.repo.list({ estado: 'CANCELADO', limit: 1 }),
    ]);

    const total = all.data.length;
    const pendientesCount = pendientes.meta.total;
    const aceptadosCount = aceptados.meta.total;
    const canceladosCount = cancelados.meta.total;

    const tasaAceptacion = total > 0 ? Number(((aceptadosCount / total) * 100).toFixed(2)) : 0;
    const tasaCancelacion = total > 0 ? Number(((canceladosCount / total) * 100).toFixed(2)) : 0;

    const promedioHorasPorEstado: Record<string, number> = {};

    for (const item of all.data) {
      const estado = item.estado || 'DESCONOCIDO';
      if (!promedioHorasPorEstado[estado]) {
        promedioHorasPorEstado[estado] = 0;
      }
    }

    return {
      total,
      pendientes: pendientesCount,
      aceptados: aceptadosCount,
      cancelados: canceladosCount,
      tasaAceptacion,
      tasaCancelacion,
      promedioHorasPorEstado,
    };
  }
}
