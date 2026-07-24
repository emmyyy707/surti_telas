import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Download, DollarSign, ShoppingBag, Users, TrendingUp, Loader2, AlertCircle, Search } from 'lucide-react';
import s from './ReportesVentas.module.css';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { reportsApi, type SalesReport } from '@/infrastructure/api/reportsApi';
import { PERIODOS_REPORTE_VENTAS, FILTROS_CUMPLIMIENTO } from '@/shared/constants/options';

interface VentaRep {
  id: string;
  asesor: string;
  ventasMes: number;
  pedidosMes: number;
  clientesNuevos: number;
  cumplimiento: number;
  ticketPromedio: number;
  comision: number;
}

interface ProductoRep {
  id: string;
  nombre: string;
  cantidad: number;
  total: number;
}

export const AdminReportesVentas: React.FC = () => {
  const [periodo, setPeriodo] = useState('ultimos_6_meses');
  const [search, setSearch] = useState('');
  const [filtroCumplimiento, setFiltroCumplimiento] = useState<string>('Todos');
  const [reporte, setReporte] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getSalesReport({ periodo });
      setReporte(data);
    } catch {
      setError('No se pudo cargar el reporte de ventas');
      toast.error('No se pudo cargar el reporte de ventas');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const asesores = useMemo<VentaRep[]>(() => {
    if (!reporte) return [];
    const totalSales = reporte.totalSales || 1;
    return (reporte.salesByAsesor || []).map((item, index) => {
      const total = Number(item.total) || 0;
      const cantidad = Number(item.cantidad) || 0;
      return {
        id: `A-${String(index + 1).padStart(3, '0')}`,
        asesor: item.asesorNombre || item.asesor || `Asesor ${index + 1}`,
        ventasMes: total,
        pedidosMes: cantidad,
        clientesNuevos: 0,
        cumplimiento: totalSales > 0 ? Math.round((total / totalSales) * 100) : 0,
        ticketPromedio: cantidad > 0 ? Math.round(total / cantidad) : 0,
        comision: Math.round(total * 0.05),
      };
    });
  }, [reporte]);

  const productos = useMemo<ProductoRep[]>(() => {
    if (!reporte) return [];
    return (reporte.topProducts || []).map((p, index) => ({
      id: `P-${String(index + 1).padStart(3, '0')}`,
      nombre: p.nombre || `Producto ${index + 1}`,
      cantidad: Number(p.cantidad) || 0,
      total: Number(p.total) || 0,
    }));
  }, [reporte]);

  const asesoresFiltrados = useMemo(() => {
    return asesores.filter(r =>
      (FILTROS_CUMPLIMIENTO.find(f => f.value === filtroCumplimiento)?.test(r.cumplimiento) ?? true) &&
      (r.asesor?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [asesores, search, filtroCumplimiento]);

  const stats = useMemo(() => {
    if (!reporte) {
      return {
        ventasTotales: 0,
        pedidosTotales: 0,
        clientesTotales: 0,
        ticketPromedio: 0,
      };
    }
    return {
      ventasTotales: Number(reporte.totalSales) || 0,
      pedidosTotales: Number(reporte.totalOrders) || 0,
      clientesTotales: Number(reporte.totalCustomers) || 0,
      ticketPromedio: Number(reporte.averageTicket) || 0,
    };
  }, [reporte]);

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Exportando reporte de ventas...');
    } catch {
      toast.error('No se pudo exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  const maxVentas = Math.max(...(reporte?.monthlyTrend?.map(m => m.ventas) || [1]));
  const chartHeight = 220;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 50 };

  const puntos = useMemo(() => {
    const trend = reporte?.monthlyTrend || [];
    return trend.map((d, i) => ({
      x: chartPadding.left + (trend.length > 1 ? (i / (trend.length - 1)) * (400 - chartPadding.left - chartPadding.right) : 0),
      y: chartPadding.top + (1 - (d.ventas || 0) / Math.max(maxVentas, 1)) * (chartHeight - chartPadding.top - chartPadding.bottom),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporte, maxVentas]);

  const pathD = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = puntos.length > 0 ? `${pathD} L ${puntos[puntos.length - 1].x} ${chartHeight - chartPadding.bottom} L ${puntos[0].x} ${chartHeight - chartPadding.bottom} Z` : '';

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Reportes de Ventas</h1>
          <p className={s.pageSubtitle}>Análisis de ventas y pedidos</p>
        </div>
        <div className={s.headerActions}>
          <div className={s.periodoSelect}>
            <select className={s.select} value={periodo} onChange={e => setPeriodo(e.target.value)}>
              {PERIODOS_REPORTE_VENTAS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Download size={16} className={s.selectIcon} />
          </div>
          <Button variant="secondary" leftIcon={<Download size={16} />} onClick={handleExport} loading={exporting}>
            Exportar
          </Button>
        </div>
      </div>

      {error && !loading && (
        <div className={s.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <Button variant="secondary" onClick={() => void loadReport()}>Reintentar</Button>
        </div>
      )}

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <DollarSign size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{formatCurrency(stats.ventasTotales)}</div>
            <div className={s.statLabel}>Ventas Totales</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardSuccess}`}>
          <ShoppingBag size={20} className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{stats.pedidosTotales}</div>
            <div className={s.statLabel}>Pedidos</div>
          </div>
        </div>
        <div className={s.statCard}>
          <Users size={20} className={s.statIconAccent} />
          <div>
            <div className={s.statValue}>{stats.clientesTotales}</div>
            <div className={s.statLabel}>Clientes</div>
          </div>
        </div>
        <div className={s.statCard}>
          <TrendingUp size={20} className={s.statIconWarning} />
          <div>
            <div className={s.statValue}>{formatCurrency(stats.ticketPromedio)}</div>
            <div className={s.statLabel}>Ticket Promedio</div>
          </div>
        </div>
      </div>

      <div className={s.chartSection}>
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>Tendencia de Ventas Mensuales</h3>
          </div>
          {loading ? (
            <div className={s.loadingRow}>
              <Loader2 size={18} className={s.spin} />
              <span>Cargando tendencia...</span>
            </div>
          ) : (
            <div className={s.lineChartContainer}>
              <div className={s.lineChartYAxis}>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                  <span key={i}>{formatCurrency(maxVentas * v)}</span>
                ))}
              </div>
              <svg className={s.lineChartSvg} viewBox={`0 0 400 ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#areaGradient)" />
                <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {puntos.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4.5" fill="var(--color-bg-surface)" stroke="var(--color-accent)" strokeWidth="2.5" />
                    <circle cx={p.x} cy={p.y} r="2.5" fill="var(--color-accent)" />
                  </g>
                ))}
                {(reporte?.monthlyTrend || []).map((d, i) => (
                  <text key={`label-${i}`} x={puntos[i]?.x ?? 0} y={chartHeight - 6} textAnchor="middle" className={s.chartXLabel}>
                    {d.mes}
                  </text>
                ))}
              </svg>
            </div>
          )}
          <div className={s.chartLegend}>
            <div className={s.legendItem}>
              <div className={`${s.legendDot} ${s.legendLine}`} />
              <span>Ventas</span>
            </div>
            <div className={s.legendItem}>
              <div className={`${s.legendDot} ${s.legendPedidos}`} />
              <span>Pedidos</span>
            </div>
          </div>
        </div>

        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>Pedidos por Estado</h3>
          </div>
          {loading ? (
            <div className={s.loadingRow}>
              <Loader2 size={18} className={s.spin} />
              <span>Cargando estados...</span>
            </div>
          ) : (
            <div className={s.statusChart}>
              {(reporte?.salesByStatus || []).length === 0 ? (
                <p className={s.noData}>Sin datos de estados</p>
              ) : (
                <table className={s.statusTable}>
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Pedidos</th>
                      <th>Total</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reporte?.salesByStatus || []).map((item, i) => (
                      <tr key={i}>
                        <td className={s.tdPrimary}>{item.estado}</td>
                        <td className={s.tdCenter}>{item.cantidad}</td>
                        <td className={`${s.tdRight} ${s.tdBold}`}>{formatCurrency(item.total)}</td>
                        <td>
                          <div className={s.miniBarWrapper}>
                            <div
                              className={s.miniBar}
                              style={{ width: `${Math.min((item.total / Math.max(reporte?.totalSales || 1, 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={s.tableSection}>
        <div className={s.tableHeader}>
          <h3 className={s.tableTitle}>Top Productos</h3>
        </div>
        {loading ? (
          <div className={s.loadingRow}>
            <Loader2 size={18} className={s.spin} />
            <span>Cargando productos...</span>
          </div>
        ) : (
          <DataTable<ProductoRep>
            data={productos}
            pageSize={10}
            emptyMessage="Sin productos"
            maxVisibleColumns={5}
            columns={[
              { key: 'nombre', header: 'Producto', sortable: true, render: (p) => <span className={s.tdPrimary}>{p.nombre}</span> },
              { key: 'cantidad', header: 'Cantidad', width: '120px', sortable: true, render: (p) => <span className={s.tdCenter}>{p.cantidad}</span> },
              { key: 'total', header: 'Total', width: '140px', sortable: true, align: 'right', render: (p) => <span className={`${s.tdRight} ${s.tdBold}`}>{formatCurrency(p.total)}</span> },
            ]}
          />
        )}
      </div>

      <div className={s.tableSection}>
        <div className={s.tableHeader}>
          <h3 className={s.tableTitle}>Ventas por Asesor</h3>
          <div className={s.tableFilters}>
            <div className={s.filterGroup}>
              {FILTROS_CUMPLIMIENTO.map(f => (
                <button
                  key={f.value}
                  className={`${s.filterBtn} ${filtroCumplimiento === f.value ? s.filterBtnActive : ''}`}
                  onClick={() => setFiltroCumplimiento(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={s.searchBox}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Buscar asesor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={s.searchInput}
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className={s.loadingRow}>
            <Loader2 size={18} className={s.spin} />
            <span>Cargando asesores...</span>
          </div>
        ) : (
          <DataTable<VentaRep>
            data={asesoresFiltrados}
            pageSize={10}
            emptyMessage="Sin resultados"
            maxVisibleColumns={5}
            detailPanel={{
              title: (r) => r.asesor,
              render: (r) => (
                <div className={s.detailPanel}>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Rendimiento del asesor</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>Ventas</span><span className={s.tdBold}>{formatCurrency(r.ventasMes)}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Pedidos</span><span>{r.pedidosMes}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Cumplimiento</span><span>{r.cumplimiento}%</span></div>
                    </div>
                  </div>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Financiero</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>Ticket promedio</span><span>{formatCurrency(r.ticketPromedio)}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Comisión estimada</span><span className={s.tdSuccess}>{formatCurrency(r.comision)}</span></div>
                    </div>
                  </div>
                </div>
              ),
            }}
            columns={[
              { key: 'asesor', header: 'Asesor', sortable: true, render: (r) => <span className={s.tdPrimary}>{r.asesor}</span> },
              { key: 'ventasMes', header: 'Ventas', width: '140px', sortable: true, render: (r) => (
                <span className={`${s.tdRight} ${s.tdBold}`}>{formatCurrency(r.ventasMes)}</span>
              )},
              { key: 'pedidosMes', header: 'Pedidos', width: '90px', sortable: true, render: (r) => <span className={s.tdCenter}>{r.pedidosMes}</span> },
              { key: 'cumplimiento', header: 'Cumplimiento', width: '150px', sortable: true, render: (r) => (
                <div className={s.cumplimientoCell}>
                  <div className={s.cumplimientoBar}>
                    <div
                      className={`${s.cumplimientoFill} ${r.cumplimiento >= 90 ? s.cumplimientoAlto : r.cumplimiento >= 75 ? s.cumplimientoMedio : s.cumplimientoBajo}`}
                      style={{ width: `${Math.min(r.cumplimiento, 100)}%` }}
                    />
                  </div>
                  <span className={`${s.cumplimientoText} ${r.cumplimiento >= 90 ? s.cumplimientoAlto : r.cumplimiento >= 75 ? s.cumplimientoMedio : s.cumplimientoBajo}`}>
                    {r.cumplimiento}%
                  </span>
                </div>
              )},
              { key: 'ticketPromedio', header: 'Ticket Prom.', width: '140px', sortable: true, render: (r) => (
                <span className={s.tdRight}>{formatCurrency(r.ticketPromedio)}</span>
              )},
            ]}
          />
        )}
      </div>
    </div>
  );
};
