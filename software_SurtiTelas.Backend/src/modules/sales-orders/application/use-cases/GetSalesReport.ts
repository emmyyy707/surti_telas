import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import { prisma } from '../../../../config/database';

export interface SalesReportFilters {
  asesorId?: string;
  clienteId?: string;
  desde?: string;
  hasta?: string;
}

export interface SalesReport {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosEnValidacion: number;
  pedidosAceptados: number;
  pedidosRechazados: number;
  recibosPendientesEnvio: number;
  ventasGeneradas: number;
  valorTotalVendido: number;
  ventasPorAsesor: Array<{ asesorId: string; asesorNombre: string; cantidad: number; total: number }>;
  ventasPorRangoFechas: Array<{ fecha: string; cantidad: number; total: number }>;
  razonesRechazo: Array<{ razon: string; cantidad: number }>;
}

export class GetSalesReport {
  constructor(
    private readonly saleRepo: SaleRepository,
  ) {}

  async execute(filters: SalesReportFilters = {}): Promise<SalesReport> {
    const where: Record<string, unknown> = { deletedAt: null, tipoFlujo: 'VENTAS' };

    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.clienteId) where.clienteId = filters.clienteId;
    if (filters.desde || filters.hasta) {
      where.fecha = {};
      if (filters.desde) (where.fecha as Record<string, Date>).gte = new Date(filters.desde);
      if (filters.hasta) (where.fecha as Record<string, Date>).lte = new Date(filters.hasta);
    }

    const [allOrders, sales] = await Promise.all([
      prisma.order.findMany({ where }),
      this.saleRepo.list(filters),
    ]);

    const pedidosPendientes = allOrders.filter((o) => o.estado === 'PENDIENTE').length;
    const pedidosEnValidacion = allOrders.filter((o) => o.estado === 'EN_VALIDACION').length;
    const pedidosAceptados = allOrders.filter((o) => o.estado === 'ACEPTADO' || o.estado === 'RECIBO_GENERADO' || o.estado === 'RECIBO_ENVIADO').length;
    const pedidosRechazados = allOrders.filter((o) => o.estado === 'RECHAZADO').length;
    const recibosPendientesEnvio = allOrders.filter((o) => o.estado === 'RECIBO_GENERADO').length;

    const valorTotalVendido = sales.reduce((sum, s) => sum + Number(s.total), 0);

    const ventasPorAsesorMap = new Map<string, { asesorNombre: string; cantidad: number; total: number }>();
    for (const s of sales) {
      const existing = ventasPorAsesorMap.get(s.asesorId) || { asesorNombre: s.asesorNombre, cantidad: 0, total: 0 };
      existing.cantidad += 1;
      existing.total += s.total;
      ventasPorAsesorMap.set(s.asesorId, existing);
    }
    const ventasPorAsesor = Array.from(ventasPorAsesorMap.entries()).map(([asesorId, data]) => ({
      asesorId,
      asesorNombre: data.asesorNombre,
      cantidad: data.cantidad,
      total: data.total,
    }));

    const ventasPorRangoMap = new Map<string, { cantidad: number; total: number }>();
    for (const s of sales) {
      const fecha = new Date(s.fechaVenta).toISOString().split('T')[0];
      const existing = ventasPorRangoMap.get(fecha) || { cantidad: 0, total: 0 };
      existing.cantidad += 1;
      existing.total += s.total;
      ventasPorRangoMap.set(fecha, existing);
    }
    const ventasPorRangoFechas = Array.from(ventasPorRangoMap.entries())
      .map(([fecha, data]) => ({ fecha, cantidad: data.cantidad, total: data.total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const rechazos = allOrders.filter((o) => o.estado === 'RECHAZADO' && o.razonRechazo);
    const razonesRechazoMap = new Map<string, number>();
    for (const r of rechazos) {
      const razon = r.razonRechazo || 'OTRA';
      razonesRechazoMap.set(razon, (razonesRechazoMap.get(razon) || 0) + 1);
    }
    const razonesRechazo = Array.from(razonesRechazoMap.entries())
      .map(([razon, cantidad]) => ({ razon, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalPedidos: allOrders.length,
      pedidosPendientes,
      pedidosEnValidacion,
      pedidosAceptados,
      pedidosRechazados,
      recibosPendientesEnvio,
      ventasGeneradas: sales.length,
      valorTotalVendido,
      ventasPorAsesor,
      ventasPorRangoFechas,
      razonesRechazo,
    };
  }
}
