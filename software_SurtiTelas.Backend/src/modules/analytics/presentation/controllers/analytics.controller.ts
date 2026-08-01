import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { prisma } from '../../../../config/database';

const AnalyticsFiltersSchema = z.object({
  desde: z.string().optional(),
  hasta: z.string().optional(),
  asesorId: z.string().optional(),
  clienteId: z.string().optional(),
  estado: z.string().optional(),
  tipoFlujo: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  const filters = parseDto(AnalyticsFiltersSchema, req.query) as {
    desde?: string;
    hasta?: string;
    asesorId?: string;
    clienteId?: string;
    estado?: string;
    tipoFlujo?: string;
    page?: number;
    limit?: number;
  };
  const { desde, hasta, asesorId, clienteId, estado, tipoFlujo } = filters;

  const whereClause: Record<string, unknown> = { deletedAt: null };
  if (desde || hasta) {
    whereClause.createdAt = {};
    if (desde) (whereClause.createdAt as Record<string, Date>).gte = new Date(desde);
    if (hasta) (whereClause.createdAt as Record<string, Date>).lte = new Date(hasta);
  }
  if (asesorId) whereClause.asesorId = asesorId;
  if (clienteId) whereClause.clienteId = clienteId;
  if (estado) whereClause.estado = estado;
  if (tipoFlujo) whereClause.tipoFlujo = tipoFlujo;

  const [totalOrders, totalSales, totalCustomers, totalRevenue, avgTicket, ordersByStatus, salesByAsesor, dailySales, topProducts, topCustomers] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.sale.count({ where: { fechaVenta: whereClause.createdAt as Record<string, Date> } }),
    prisma.customer.count({ where: { createdAt: whereClause.createdAt as Record<string, Date> } }),
    prisma.sale.aggregate({ where: { fechaVenta: whereClause.createdAt as Record<string, Date> }, _sum: { total: true } }),
    prisma.sale.aggregate({ where: { fechaVenta: whereClause.createdAt as Record<string, Date> }, _avg: { total: true } }),
    prisma.order.groupBy({ by: ['estado'], where: whereClause, _count: { id: true } }),
    prisma.sale.groupBy({ by: ['asesorId'], where: { fechaVenta: whereClause.createdAt as Record<string, Date> }, _sum: { total: true }, _count: { id: true } }),
    prisma.$queryRaw<{ fecha: string; cantidad: number; total: number }[]>`SELECT DATE(created_at) as fecha, COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total FROM "Order" WHERE deleted_at IS NULL`,
    prisma.$queryRaw<{ nombre: string; cantidad: number; total: number }[]>`SELECT p.nombre as nombre, SUM(oi.cantidad) as cantidad, SUM(oi.precio * oi.cantidad) as total FROM "Order" o JOIN "OrderItem" oi ON oi."orderId" = o.id JOIN "Product" p ON p.id = oi."productId" WHERE o.deleted_at IS NULL GROUP BY p.nombre ORDER BY total DESC LIMIT 10`,
    prisma.$queryRaw<{ cliente: string; cantidad: number; total: number }[]>`SELECT c.nombre as cliente, COUNT(o.id) as cantidad, COALESCE(SUM(o.total), 0) as total FROM "Order" o JOIN "Customer" c ON c.id = o."clienteId" WHERE o.deleted_at IS NULL GROUP BY c.nombre ORDER BY total DESC LIMIT 10`,
  ]);

  const kpi = {
    totalPedidos: totalOrders,
    totalVentas: totalSales,
    totalClientes: totalCustomers,
    ingresosTotales: Number(totalRevenue._sum.total) || 0,
    ticketPromedio: Number(avgTicket._avg.total) || 0,
    pedidosPorEstado: ordersByStatus.map((s: { estado: string; _count: { id: number } }) => ({
      estado: s.estado,
      cantidad: s._count.id,
    })),
    ventasPorAsesor: salesByAsesor.map((s: { asesorId: string; _sum: { total: unknown }; _count: { id: number } }) => ({
      asesorId: s.asesorId,
      total: Number(s._sum.total) || 0,
      cantidad: s._count.id,
    })),
    tendenciaDiaria: dailySales.map((d: { fecha: string; cantidad: number; total: number }) => ({
      fecha: d.fecha,
      ventas: d.cantidad,
      total: Number(d.total),
    })),
    topProductos: topProducts.map((p: { nombre: string; cantidad: number; total: number }) => ({
      nombre: p.nombre,
      cantidad: p.cantidad || 0,
      total: Number(p.total) || 0,
    })),
    topClientes: topCustomers.map((c: { cliente: string; cantidad: number; total: number }) => ({
      cliente: c.cliente,
      cantidad: c.cantidad || 0,
      total: Number(c.total) || 0,
    })),
  };

  return ok(res, kpi);
};

export const getMonthlyComparison = async (req: Request, res: Response) => {
  const filters = parseDto(AnalyticsFiltersSchema, req.query) as { desde?: string; hasta?: string };
  const { desde, hasta } = filters;

  const currentMonth = new Date();
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const periodStart = desde ? new Date(desde) : previousMonth;
  const periodEnd = hasta ? new Date(hasta) : currentMonth;

  const [current, previous] = await Promise.all([
    prisma.sale.aggregate({
      where: { fechaVenta: { gte: periodStart, lte: periodEnd } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.sale.aggregate({
      where: { fechaVenta: { gte: previousMonth, lt: periodStart } },
      _sum: { total: true },
      _count: { id: true },
    }),
  ]);

  const currentTotal = Number(current._sum.total) || 0;
  const previousTotal = Number(previous._sum.total) || 0;
  const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return ok(res, {
    currentPeriodo: { total: currentTotal, pedidos: current._count.id, promedio: current._count.id > 0 ? currentTotal / current._count.id : 0 },
    previousPeriodo: { total: previousTotal, pedidos: previous._count.id, promedio: previous._count.id > 0 ? previousTotal / previous._count.id : 0 },
    crecimiento: { porcentaje: Math.round(growth * 100) / 100, absoluto: currentTotal - previousTotal },
  });
};
