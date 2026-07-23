import React, { useState, useEffect, useMemo } from 'react'
import { Download, Calendar, BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './AdminReportes.module.css';
import { StatCard } from './StatCard';
import { Badge } from '../../../shared/ui/Badge';
import { BarChart, LineChart as LineChartComp, PieChart as PieChartComp, TopProducts } from './Chart';
import { reportsApi, type Report, type SalesReport } from '../../../infrastructure/api/reportsApi';
import { adminContent } from '@/shared/config/adminContent';

const formatCurrency = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return adminContent.reports.relativeTimes.moment;
  if (diffMins < 60) return adminContent.reports.relativeTimes.minutes(diffMins);
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return adminContent.reports.relativeTimes.hours(diffHours);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return adminContent.reports.relativeTimes.yesterday;
  if (diffDays < 7) return adminContent.reports.relativeTimes.days(diffDays);
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatPeriod(report: Report): string {
  if (report.fechaInicio && report.fechaFin) {
    const start = new Date(report.fechaInicio);
    const end = new Date(report.fechaFin);
    const fmt = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format;
    const startStr = fmt(start);
    const endStr = fmt(end);
    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  }
  return adminContent.reports.states.noPeriod;
}

export const AdminReportes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportsContent = adminContent.reports;

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);
        const [reportsData, salesData] = await Promise.all([
          reportsApi.list(),
          reportsApi.getSalesReport().catch(() => null),
        ]);
        if (!cancelled) {
          setReports(reportsData);
          setSales(salesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar reportes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReports();
    return () => { cancelled = true; };
  }, []);

  const reportStats = useMemo(() => {
    if (!sales) return [];
    return [
      { label: reportsContent.stats.totalSales, value: formatCurrency(sales.totalSales), trend: '', trendUp: true, Icon: BarChart3, color: 'accent' as const },
      { label: reportsContent.stats.completedOrders, value: sales.totalOrders.toLocaleString('es-CO'), trend: '', trendUp: true, Icon: TrendingUp, color: 'success' as const },
      { label: reportsContent.stats.newCustomers, value: sales.totalCustomers.toLocaleString('es-CO'), trend: '', trendUp: true, Icon: PieChart, color: 'info' as const },
      { label: reportsContent.stats.averageTicket, value: formatCurrency(sales.averageTicket), trend: '', trendUp: false, Icon: LineChart, color: 'warning' as const },
    ];
  }, [sales]);

  const ventasPorCategoria = useMemo(
    () => (sales?.salesByStatus ?? []).map(s => ({ label: s.estado, value: s.cantidad })),
    [sales]
  );

  const tendenciaMensual = useMemo(
    () => (sales?.monthlyTrend ?? []).map(t => ({ label: t.mes, value: t.ventas })),
    [sales]
  );

  const rankingAsesores = useMemo(
    () => (sales?.salesByAsesor ?? []).map((a, i) => ({ label: a.asesorNombre || a.asesor || `Asesor ${i + 1}`, value: a.cantidad })),
    [sales]
  );

  const productosTop = useMemo(
    () => (sales?.topProducts ?? []).map((p, i) => ({ rank: i + 1, name: p.nombre, sales: formatCurrency(p.total) })),
    [sales]
  );

  const filteredReportes = reports.filter(r =>
    r.titulo.toLowerCase().includes(search.toLowerCase()) ||
    r.tipo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Reportes</h1>
            <p className={s.pageSubtitle}>Análisis y reportes del sistema</p>
          </div>
        </div>
        <div className={s.statsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s.statCard}>
              <div className={s.statIcon} style={{ opacity: 0.3 }}><BarChart3 size={22} /></div>
              <div className={s.statValue} style={{ opacity: 0.3 }}>—</div>
              <div className={s.statLabel} style={{ opacity: 0.3 }}>{reportsContent.states.loading}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Reportes</h1>
            <p className={s.pageSubtitle}>Análisis y reportes del sistema</p>
          </div>
        </div>
        <div className={s.statCard} style={{ textAlign: 'center', color: 'var(--color-danger)' }}>
          <p>{error}</p>
          <button
            className={s.filterBtn}
            style={{ marginTop: 12, cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            {reportsContent.states.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>{reportsContent.title}</h1>
          <p className={s.pageSubtitle}>{reportsContent.subtitle}</p>
        </div>
      </div>

      {reportStats.length > 0 && (
        <div className={s.statsGrid}>
          {reportStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      <div className={s.toolbar}>
        <SearchInput
          placeholder={reportsContent.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
        <button className={s.filterBtn}>
          <Calendar size={14} />
          {reportsContent.filterLabel}
        </button>
      </div>

      {(ventasPorCategoria.length > 0 || tendenciaMensual.length > 0 || rankingAsesores.length > 0 || productosTop.length > 0) && (
        <div className={s.reportGrid}>
          {ventasPorCategoria.length > 0 && (
            <div className={s.chartCard}>
              <PieChartComp data={ventasPorCategoria} title={reportsContent.charts.salesByStatus} />
            </div>
          )}
          {tendenciaMensual.length > 0 && (
            <div className={s.chartCard}>
              <LineChartComp data={tendenciaMensual} title={reportsContent.charts.monthlyTrend} />
            </div>
          )}
          {rankingAsesores.length > 0 && (
            <div className={s.chartCard}>
              <BarChart data={rankingAsesores} title={reportsContent.charts.rankingAsesores} />
            </div>
          )}
          {productosTop.length > 0 && (
            <div className={s.chartCard}>
              <TopProducts data={productosTop} title={reportsContent.charts.topProducts} />
            </div>
          )}
        </div>
      )}

      <div className={s.tableSection}>
        <h2 className={s.sectionTitle}>{reportsContent.table.generatedReports}</h2>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>{reportsContent.table.id}</th>
                <th>{reportsContent.table.title}</th>
                <th>{reportsContent.table.period}</th>
                <th>{reportsContent.table.generated}</th>
                <th>{reportsContent.table.status}</th>
                <th>{reportsContent.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReportes.map(reporte => (
                <tr key={reporte.id}>
                  <td className={s.tdMono}>{reporte.id}</td>
                  <td className={s.tdPrimary}>{reporte.titulo}</td>
                  <td>{formatPeriod(reporte)}</td>
                  <td>{formatRelativeDate(reporte.createdAt)}</td>
                  <td>
                    <Badge variant={'success'}>
                      {reportsContent.states.available}
                    </Badge>
                  </td>
                  <td>
                    <button className={s.downloadBtn}>
                      <Download size={14} />
                      {reportsContent.table.download}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReportes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                    {reportsContent.table.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
