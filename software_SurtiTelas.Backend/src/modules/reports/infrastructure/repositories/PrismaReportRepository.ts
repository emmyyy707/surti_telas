import { Decimal } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import {
  InventoryReport,
  ProductionReport,
  ReportRepository,
  SalesReport,
  UsersReport,
} from '../../domain/repositories/ReportRepository';
import { DateRangeFilter } from '../../application/use-cases/GetSalesReport';

export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private buildDateWhere(range?: DateRangeFilter) {
    if (!range?.from && !range?.to) return undefined;
    const gte = range.from ? new Date(range.from) : undefined;
    const lte = range.to ? new Date(range.to) : undefined;
    return { gte, lte };
  }

  async getSalesReport(range?: DateRangeFilter): Promise<SalesReport> {
    const dateWhere = this.buildDateWhere(range);
    const where = { deletedAt: null, ...(dateWhere ? { createdAt: dateWhere } : {}) };

    const [orders, orderItems, ordersByAsesor] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        select: { total: true, estado: true, asesorId: true, asesorNombre: true },
      }),
      this.prisma.orderItem.findMany({
        where: { order: where },
        select: { productId: true, nombre: true, cantidad: true, precio: true },
      }),
      this.prisma.order.findMany({
        where,
        select: { asesorId: true, asesorNombre: true, total: true },
      }),
    ]);

    const totalSales = orders.reduce((acc, o) => acc + Number(o.total), 0);

    const statusMap = new Map<string, number>();
    for (const o of orders) {
      statusMap.set(o.estado, (statusMap.get(o.estado) ?? 0) + 1);
    }
    const ordersByStatus = Array.from(statusMap, ([estado, cantidad]) => ({ estado, cantidad }));

    const productMap = new Map<string, { productId: string; nombre: string; cantidad: number; total: number }>();
    for (const item of orderItems) {
      const key = item.productId ?? item.nombre;
      const current = productMap.get(key) ?? {
        productId: item.productId ?? '',
        nombre: item.nombre,
        cantidad: 0,
        total: 0,
      };
      current.cantidad += item.cantidad;
      current.total += Number(item.precio) * item.cantidad;
      productMap.set(key, current);
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const asesorMap = new Map<string, { asesorId: string; asesorNombre: string; total: number; ordenes: number }>();
    for (const o of ordersByAsesor) {
      const current = asesorMap.get(o.asesorId) ?? {
        asesorId: o.asesorId,
        asesorNombre: o.asesorNombre,
        total: 0,
        ordenes: 0,
      };
      current.total += Number(o.total);
      current.ordenes += 1;
      asesorMap.set(o.asesorId, current);
    }
    const salesByAsesor = Array.from(asesorMap.values()).sort((a, b) => b.total - a.total);

    return {
      totalSales,
      totalOrders: orders.length,
      ordersByStatus,
      topProducts,
      salesByAsesor,
    };
  }

  async getInventoryReport(): Promise<InventoryReport> {
    const [totalProducts, lowStock, agotado, movements, productsWithCategory] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null, stockStatus: 'BAJO_STOCK' } }),
      this.prisma.product.count({ where: { deletedAt: null, stockStatus: 'AGOTADO' } }),
      this.prisma.inventoryMovement.findMany({
        where: { deletedAt: null },
        select: { tipo: true, cantidad: true },
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null },
        select: { categoriaId: true, categoria: { select: { nombre: true } } },
      }),
    ]);

    const movementMap = new Map<string, { tipo: string; cantidad: number; movimientos: number }>();
    for (const m of movements) {
      const current = movementMap.get(m.tipo) ?? { tipo: m.tipo, cantidad: 0, movimientos: 0 };
      current.cantidad += m.cantidad;
      current.movimientos += 1;
      movementMap.set(m.tipo, current);
    }
    const stockMovements = Array.from(movementMap.values());

    const categoryMap = new Map<string, { categoriaId: string | null; nombre: string | null; productos: number }>();
    for (const p of productsWithCategory) {
      const key = p.categoriaId ?? 'sin-categoria';
      const current = categoryMap.get(key) ?? {
        categoriaId: p.categoriaId,
        nombre: p.categoria?.nombre ?? null,
        productos: 0,
      };
      current.productos += 1;
      categoryMap.set(key, current);
    }
    const categories = Array.from(categoryMap.values());

    return {
      totalProducts,
      lowStock,
      agotado,
      stockMovements,
      categories,
    };
  }

  async getProductionReport(): Promise<ProductionReport> {
    const [orders, ordersByTaller] = await this.prisma.$transaction([
      this.prisma.productionOrder.findMany({
        where: { deletedAt: null },
        select: { estado: true, avance: true, fechaEstimada: true, tallerId: true, taller: { select: { nombre: true } } },
      }),
      this.prisma.productionOrder.findMany({
        where: { deletedAt: null },
        select: { avance: true, fechaEstimada: true, tallerId: true, taller: { select: { nombre: true } } },
      }),
    ]);

    const now = new Date();
    const statusMap = new Map<string, number>();
    let avanceTotal = 0;
    let tardios = 0;
    for (const o of orders) {
      statusMap.set(o.estado, (statusMap.get(o.estado) ?? 0) + 1);
      avanceTotal += o.avance;
      if (o.avance < 100 && new Date(o.fechaEstimada) < now) {
        tardios += 1;
      }
    }
    const ordersByEstado = Array.from(statusMap, ([estado, cantidad]) => ({ estado, cantidad }));
    const avancePromedio = orders.length ? Math.round(avanceTotal / orders.length) : 0;

    const tallerMap = new Map<string, { tallerId: string | null; nombre: string | null; ordenes: number; avanceSuma: number }>();
    for (const o of ordersByTaller) {
      const key = o.tallerId ?? 'sin-taller';
      const current = tallerMap.get(key) ?? {
        tallerId: o.tallerId,
        nombre: o.taller?.nombre ?? null,
        ordenes: 0,
        avanceSuma: 0,
      };
      current.ordenes += 1;
      current.avanceSuma += o.avance;
      tallerMap.set(key, current);
    }
    const porTaller = Array.from(tallerMap.values()).map((t) => ({
      tallerId: t.tallerId,
      nombre: t.nombre,
      ordenes: t.ordenes,
      avancePromedio: t.ordenes ? Math.round(t.avanceSuma / t.ordenes) : 0,
    }));

    return {
      totalOrders: orders.length,
      ordersByEstado,
      avancePromedio,
      tardios,
      porTaller,
    };
  }

  async getUsersReport(range?: DateRangeFilter): Promise<UsersReport> {
    const dateWhere = this.buildDateWhere(range);
    const where = { deletedAt: null, ...(dateWhere ? { createdAt: dateWhere } : {}) };

    const [users, recentUsers] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: { role: true, estado: true },
      }),
      this.prisma.user.findMany({
        where,
        select: { id: true, nombre: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const roleMap = new Map<string, number>();
    let active = 0;
    let inactive = 0;
    for (const u of users) {
      roleMap.set(u.role, (roleMap.get(u.role) ?? 0) + 1);
      if (u.estado === 'ACTIVO') active += 1;
      else inactive += 1;
    }
    const byRole = Array.from(roleMap, ([role, cantidad]) => ({ role, cantidad }));

    return {
      totalUsers: users.length,
      byRole,
      active,
      inactive,
      recentRegistrations: recentUsers,
    };
  }
}

export { Decimal };
