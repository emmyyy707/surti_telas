import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export async function getReportVentas() {
  const orders = await prisma.orders.findMany();
  const totalVentas = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const pedidosCompletados = orders.filter((order) => order.status).length;
  return { totalVentas, pedidosCompletados };
}

export async function getReportInventario() {
  const products = await prisma.products.findMany();
  const totalProductos = products.length;
  const stockTotal = products.reduce((sum, product) => sum + Number(product.stock ?? 0), 0);
  return { totalProductos, stockTotal };
}

export async function getReportComisiones() {
  const orders = await prisma.orders.findMany();
  const comisionesPagadas = orders.reduce((sum, order) => sum + (Number(order.total ?? 0) * 0.05), 0);
  return { comisionesPagadas, porcentaje: 0.05 };
}

export async function getReportClientes() {
  const clientes = await prisma.customers.count();
  return { clientesNuevos: clientes };
}

export async function getReportProductosTop() {
  const details = await prisma.orders_details.groupBy({
    by: ["id_product"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const items = await Promise.all(details.map(async (detail) => {
    const product = await prisma.products.findUnique({ where: { id_product: detail.id_product ?? undefined } });
    return {
      id: detail.id_product ?? 0,
      nombre: product?.name ?? "Desconocido",
      totalVendidos: detail._sum.quantity ?? 0,
    };
  }));
  return items;
}

export async function getReportAsesores() {
  const asesores = await prisma.users.findMany({
    where: { roles: { name: "asesor" } },
    include: { customers: { include: { orders: true } } },
  });
  return asesores.map((user) => ({
    id: user.id_user,
    nombre: `${user.name} ${user.last_name}`.trim(),
    pedidos: user.customers?.orders?.length ?? 0,
  }));
}

export async function getReportVentasMensuales() {
  const orders = await prisma.orders.findMany();
  const mensual: Record<string, number> = {};
  orders.forEach((order) => {
    const fecha = order.order_date ? new Date(order.order_date).toISOString().slice(0, 7) : "unknown";
    mensual[fecha] = (mensual[fecha] ?? 0) + Number(order.total ?? 0);
  });
  return Object.entries(mensual).map(([mes, total]) => ({ mes, total }));
}
