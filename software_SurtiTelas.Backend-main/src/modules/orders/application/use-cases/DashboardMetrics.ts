import { PrismaClient } from '@prisma/client';
import { dbToOrderStatus } from '../../infrastructure/mappers/OrderMapper';

export class GetDashboardMetrics {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    const [
      totalOrders,
      totalCustomers,
      totalSales,
      ordersByStatusRaw,
      recentOrders,
      lowStockProducts,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.order.aggregate({
        where: { deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: { deletedAt: null },
        select: { estado: true },
      }),
      this.prisma.order.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          numero: true,
          clienteId: true,
          clienteNombre: true,
          asesorId: true,
          asesorNombre: true,
          fecha: true,
          total: true,
          itemsCount: true,
          estado: true,
          prioridad: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
              telefono: true,
              nit: true,
              cupoTotal: true,
              cupoUsado: true,
              deudaVencida: true,
              isTrustedCustomer: true,
              estado: true,
            },
          },
          asesor: {
            select: {
              id: true,
              email: true,
              nombre: true,
              telefono: true,
              role: true,
              estado: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null, stockStatus: { in: ['BAJO_STOCK', 'AGOTADO'] } },
        orderBy: { cantidadStock: 'asc' },
        take: 10,
      }),
    ]);

    const recentOrdersMapped = recentOrders.map(order => ({
      ...order,
      estado: dbToOrderStatus(order.estado),
      prioridad: order.prioridad === 'ESTANDAR' ? 'Estándar' : 'Prioritario',
    }));

    const ordersByStatusMap = new Map<string, number>();
    for (const order of ordersByStatusRaw) {
      const estado = dbToOrderStatus(order.estado);
      ordersByStatusMap.set(estado, (ordersByStatusMap.get(estado) || 0) + 1);
    }
    const ordersByStatus = Array.from(ordersByStatusMap, ([estado, cantidad]) => ({ estado, cantidad }));

    return {
      totalOrders,
      totalCustomers,
      totalSales: totalSales._sum.total ?? 0,
      ordersByStatus,
      recentOrders: recentOrdersMapped,
      lowStockProducts,
    };
  }
}
