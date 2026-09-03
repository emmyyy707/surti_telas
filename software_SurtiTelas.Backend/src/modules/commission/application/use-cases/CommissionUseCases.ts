import { prisma } from '../../../../config/database';

export class CalculateCommission {
  async calculateForAsesor(asesorId: string, fechaInicio: string, fechaFin: string) {
    const sales = await prisma.sale.findMany({
      where: {
        asesorId,
        deletedAt: null,
        estado: { not: 'ANULADA' },
        paymentStatus: { notIn: ['ANULADO', 'REFUNDED', 'REJECTED'] },
        fechaVenta: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
      },
      select: { total: true },
    });
    let totalVentas = 0;
    let totalComision = 0;
    for (const sale of sales) {
      const venta = Number(sale.total);
      totalVentas += venta;
      totalComision += venta * 0.05;
    }
    return { asesorId, totalVentas, comisionTotal: totalComision, ventasCount: sales.length };
  }

  async calculateForPeriod(fechaInicio: string, fechaFin: string) {
    const allSales = await prisma.sale.findMany({
      where: {
        deletedAt: null,
        estado: { not: 'ANULADA' },
        paymentStatus: { notIn: ['ANULADO', 'REFUNDED', 'REJECTED'] },
        fechaVenta: { gte: new Date(fechaInicio), lte: new Date(fechaFin) },
      },
      select: { asesorId: true, asesorNombre: true, total: true },
    });
    const asesorMap = new Map<string, { asesorNombre: string; totalVentas: number; comision: number }>();
    for (const sale of allSales) {
      const key = sale.asesorId;
      const existing = asesorMap.get(key) || { asesorNombre: sale.asesorNombre, totalVentas: 0, comision: 0 };
      existing.totalVentas += Number(sale.total);
      existing.comision += Number(sale.total) * 0.05;
      asesorMap.set(key, existing);
    }
    return Array.from(asesorMap.entries()).map(([asesorId, data]) => ({
      asesorId,
      asesorNombre: data.asesorNombre,
      totalVentas: data.totalVentas,
      comisionTotal: data.comision,
      ventasCount: allSales.filter((s) => s.asesorId === asesorId).length,
    }));
  }
}

export class TrackCommissionPayment {
  async recordPayment(data: { asesorId: string; monto: number; fechaPago: Date }) {
    await prisma.commission.create({
      data: {
        asesorId: data.asesorId,
        orderId: '',
        monto: data.monto,
        porcentaje: 5,
        estado: 'pagado',
      },
    });
    return { success: true };
  }

  async getPaymentHistory(asesorId: string) {
    return prisma.commission.findMany({
      where: { asesorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
