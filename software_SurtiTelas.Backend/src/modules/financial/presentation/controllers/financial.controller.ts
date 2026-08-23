import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { prisma } from '../../../../config/database';

const FinancialReportSchema = z.object({
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const getFinancialReport = async (req: Request, res: Response) => {
  const filters = parseDto(FinancialReportSchema, req.query);
  const whereFecha: Record<string, Date> = {};
  if ((filters as { desde?: string }).desde) whereFecha.gte = new Date((filters as { desde?: string }).desde!);
  if ((filters as { hasta?: string }).hasta) whereFecha.lte = new Date((filters as { hasta?: string }).hasta!);

  const [salesResult, paymentsResult, pendingPaymentsResult] = await Promise.all([
    prisma.sale.aggregate({ where: { fechaVenta: whereFecha }, _sum: { total: true } }),
    prisma.payment.aggregate({ where: { createdAt: whereFecha, status: 'APPROVED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { createdAt: whereFecha, status: 'PENDING' }, _sum: { amount: true } }),
  ]);

  const ingresos = Number(salesResult._sum.total) || 0;
  const gastos = Number(paymentsResult._sum.amount) || 0;
  const utilidadNeta = ingresos - gastos;
  const margen = ingresos > 0 ? (utilidadNeta / ingresos) * 100 : 0;

  return ok(res, {
    ingresosTotales: ingresos,
    gastosTotales: gastos,
    utilidadNeta,
    margenUtilidad: Math.round(margen * 100) / 100,
    cuentasPorCobrar: Number(pendingPaymentsResult._sum.amount) || 0,
    cuentasPorPagar: 0,
    flujoCaja: ingresos - gastos,
    ventasPorProducto: [],
    ventasPorAsesor: [],
  });
};
