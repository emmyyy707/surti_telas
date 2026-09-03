import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { prisma } from '../../../../config/database';

const CommissionQuerySchema = z.object({
  asesorId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const getCommissionReport = async (req: Request, res: Response) => {
  const filters = parseDto(CommissionQuerySchema, req.query);
  const where: Record<string, unknown> = {};
  if ((filters as { asesorId?: string }).asesorId) where.asesorId = (filters as { asesorId?: string }).asesorId;

  const sales = await prisma.sale.findMany({
    where: {
      ...where,
      deletedAt: null,
      estado: { not: 'ANULADA' },
      paymentStatus: { notIn: ['ANULADO', 'REFUNDED', 'REJECTED'] },
      fechaVenta: {
        gte: (filters as { desde?: string }).desde ? new Date((filters as { desde?: string }).desde!) : undefined,
        lte: (filters as { hasta?: string }).hasta ? new Date((filters as { hasta?: string }).hasta!) : undefined,
      } as Record<string, Date>,
    },
  });

  const asesorMap = new Map<string, { asesorNombre: string; totalVentas: number; comision: number; ventasCount: number }>();
  for (const sale of sales) {
    const key = sale.asesorId;
    const existing = asesorMap.get(key) || { asesorNombre: sale.asesorNombre, totalVentas: 0, comision: 0, ventasCount: 0 };
    existing.totalVentas += Number(sale.total);
    existing.comision += Number(sale.total) * 0.05;
    existing.ventasCount += 1;
    asesorMap.set(key, existing);
  }

  const result = Array.from(asesorMap.entries()).map(([asesorId, data]) => ({
    asesorId,
    asesorNombre: data.asesorNombre,
    totalVentas: data.totalVentas,
    comisionTotal: data.comision,
    ventasCount: data.ventasCount,
  }));

  return ok(res, { data: result, totalComisiones: result.reduce((s, r) => s + r.comisionTotal, 0) });
};
