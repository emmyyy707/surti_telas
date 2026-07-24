import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { StatCard } from './StatCard';
import { BarChart, LineChart, PieChart, TopProducts } from './Chart';
import s from './Dashboard.module.css';
import { Badge } from '../../../shared/ui/Badge';
import { Users, ShoppingBag, DollarSign, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '@/infrastructure/api/authApi';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { paymentsApi } from '@/infrastructure/api/paymentsApi';
import { adminContent } from '@/shared/config/adminContent';
import { ORDER_STATUS_COLORS } from '@/shared/constants/options';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

const formatoMes = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

interface DashboardMetrics {
  totalOrders: number;
  totalCustomers: number;
  totalSales: number;
  ordersByStatus: { estado: string; cantidad: number }[];
  recentOrders: Array<{
    id: string;
    numero: string;
    clienteNombre: string;
    asesorNombre: string;
    total: number;
    estado: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{ id: string; ref: string; nombre: string; cantidadStock: number }>;
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dashboardContent = adminContent.dashboard;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!tokenStorage.getAccessToken()) {
      setError('No hay sesión activa. Inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    try {
      const [usersResult, ordersResult, paymentsResult] = await Promise.all([
        authApi.listUsers({ limit: 100, role: 'CLIENTE' }),
        ordersApi.list({ page: 1, limit: 100 }),
        paymentsApi.list(),
      ]);

      const clientes = (usersResult.data ?? []).filter(u => u.role === 'CLIENTE');
      const clientesIds = new Set(clientes.map(u => u.id));
      const pedidos = (ordersResult.pedidos ?? []).filter(p => p.clienteId && clientesIds.has(p.clienteId));
      const pagos = paymentsResult ?? [];

      const totalCustomers = clientes.length;
      const totalOrders = pedidos.length;
      const totalSales = pagos.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const estadoMap = new Map<string, number>();
      for (const p of pedidos) {
        estadoMap.set(p.estado, (estadoMap.get(p.estado) ?? 0) + 1);
      }
      const ordersByStatus = Array.from(estadoMap, ([estado, cantidad]) => ({ estado, cantidad }));

      const recentOrders = pedidos
        .slice()
        .sort((a, b) => String(b.id).localeCompare(String(a.id)))
        .slice(0, 6)
        .map(p => ({
          id: p.id,
          numero: p.numero || p.id,
          clienteNombre: p.cliente,
          asesorNombre: p.asesor,
          total: Number(p.total) || 0,
          estado: p.estado,
          createdAt: new Date().toISOString(),
        }));

      setMetrics({
        totalOrders,
        totalCustomers,
        totalSales,
        ordersByStatus,
        recentOrders,
        lowStockProducts: [],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar las métricas del dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: dashboardContent.stats.totalCustomers, value: metrics.totalCustomers.toLocaleString('es-CO'), trend: '', trendUp: true, Icon: Users, color: 'accent' as const },
      { label: dashboardContent.stats.totalOrders, value: metrics.totalOrders.toLocaleString('es-CO'), trend: '', trendUp: true, Icon: ShoppingBag, color: 'success' as const },
      { label: dashboardContent.stats.activeProduction, value: ((metrics.ordersByStatus ?? []).find(o => o.estado === 'En producción')?.cantidad ?? 0).toLocaleString('es-CO'), trend: '', trendUp: true, Icon: TrendingUp, color: 'info' as const },
      { label: dashboardContent.stats.totalSales, value: formatoCOP(metrics.totalSales ?? 0), trend: '', trendUp: true, Icon: DollarSign, color: 'warning' as const },
    ];
  }, [metrics, dashboardContent]);

  const recentOrders = metrics?.recentOrders ?? [];

  return (
    <div>
      <h1 className={s.pageTitle}>{dashboardContent.title}</h1>
      <p className={s.pageSubtitle}>{dashboardContent.subtitle}</p>

      {loading && (
        <div className={s.loadingRow}>
          <Loader2 size={18} className={s.spin} />
          <span>{dashboardContent.loading}</span>
        </div>
      )}
      {error && !loading && (
        <div className={s.errorRow}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className={s.retryBtn} onClick={() => void loadDashboard()}>
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {metrics && !loading && (
        <>
          <div className={s.statsGrid}>
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          <div className={s.chartsGrid}>
            <div className={s.chartCard}>
              <BarChart data={recentOrders.slice(0, 6).map((o, i) => ({ label: `#${i + 1}`, value: o.total ?? 0 }))} title={dashboardContent.charts.salesByOrder} />
            </div>
            <div className={s.chartCard}>
              <PieChart data={(metrics.ordersByStatus || []).map(o => ({ label: o.estado, value: o.cantidad ?? 0 }))} title={dashboardContent.charts.orderStatus} />
            </div>
            <div className={s.chartCard}>
              <LineChart data={(metrics.ordersByStatus || []).map(o => ({ label: o.estado.slice(0, 3), value: o.cantidad ?? 0 }))} title={dashboardContent.charts.trendOrders} />
            </div>
            <div className={s.chartCard}>
              <TopProducts data={(metrics.lowStockProducts || []).slice(0, 5).map((p, i) => ({ rank: i + 1, name: p.nombre, sales: `${p.cantidadStock ?? 0} uds` }))} title={dashboardContent.charts.lowStock} />
            </div>
          </div>

          <div className={s.bottomGrid}>
            <div className={s.tableSection}>
              <h2 className={s.sectionTitle}>{dashboardContent.tables.recentOrders}</h2>
              <div className={s.tableWrapper}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.5)' }}>
                          {dashboardContent.tables.empty}
                        </td>
                      </tr>
                    ) : (
                       recentOrders.map((order) => (
                         <tr key={order.id}>
                           <td className={s.tdMono}>{order.numero}</td>
                           <td className={s.tdPrimary}>{order.clienteNombre}</td>
                           <td>{order.asesorNombre}</td>
                           <td>{formatoCOP(order.total)}</td>
                           <td>
                              <Badge variant={ORDER_STATUS_COLORS[order.estado] ?? 'default'}>
                               {order.estado}
                             </Badge>
                           </td>
                           <td>{formatoMes(order.createdAt)}</td>
                         </tr>
                       ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={s.activitySection}>
              <h2 className={s.sectionTitle}>{dashboardContent.tables.recentActivity}</h2>
              <div className={s.activityList}>
                {recentOrders.length === 0 ? (
                  <div className={s.activityItem}>
                    <span className={s.activityText}>{dashboardContent.tables.noActivity}</span>
                  </div>
                ) : (
                     recentOrders.slice(0, 4).map((order) => (
                       <div className={s.activityItem} key={order.id}>
                         <span className={s.activityTime}>{formatoMes(order.createdAt)}</span>
                         <span className={s.activityText}>Pedido {order.numero} · {order.clienteNombre}</span>
                       </div>
                     ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
