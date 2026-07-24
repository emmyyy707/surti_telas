import React, { useState, useEffect } from 'react';
import { Search, Download, Factory, CheckCircle, Clock, Package, BarChart3, TrendingUp, ChevronDown } from 'lucide-react';
import s from './ReportesProduccion.module.css';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { reportsApi, type ProductionReport } from '@/infrastructure/api/reportsApi';
import { PERIODOS_REPORTE_VENTAS, FILTROS_EFICIENCIA } from '@/shared/constants/options';

interface ProduccionRep {
  id: string;
  taller: string;
  ordenesCompletadas: number;
  ordenesPendientes: number;
  eficiencia: number;
  prendasProducidas: number | null;
  valorProduccion: number | null;
  promedioDias: number | null;
}

export const AdminReportesProduccion: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtroEficiencia, setFiltroEficiencia] = useState<string>('Todos');
  const [report, setReport] = useState<ProductionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.getProductionReport();
        setReport(data);
      } catch {
        setError('No se pudo cargar el reporte de producción');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  type TallerNormalizado = { taller: string; ordenes: number };
  const porTaller = (report?.porTaller ?? []) as { nombre: string | null; ordenes: number }[];
  const porTallerLegacy = (report?.ordersByWorkshop ?? []) as { taller: string; cantidad: number }[];
  const talleres: TallerNormalizado[] = [
    ...porTaller.map(t => ({ taller: t.nombre ?? '', ordenes: t.ordenes })),
    ...porTallerLegacy.map(t => ({ taller: t.taller, ordenes: t.cantidad })),
  ];

  const estados = report?.ordersByStatus ?? report?.ordersByEstado ?? [];

  const reportes: ProduccionRep[] = talleres.map((w, index) => ({
    id: `R-${String(index + 1).padStart(3, '0')}`,
    taller: w.taller ?? '',
    ordenesCompletadas: estados.find(s => s.estado === 'TERMINADO')?.cantidad || 0,
    ordenesPendientes: estados.find(s => s.estado === 'PENDIENTE')?.cantidad || 0,
    eficiencia: report!.averageProgress ?? report!.avancePromedio ?? 0,
    prendasProducidas: null,
    valorProduccion: null,
    promedioDias: null,
  }));

  const produccionMensual = report ? [
    { mes: 'Actual', ordenes: report.totalOrders, completadas: estados.find(s => s.estado === 'TERMINADO')?.cantidad || 0, pendientes: estados.find(s => s.estado === 'PENDIENTE')?.cantidad || 0 },
  ] : [];

  const maxOrdenes = Math.max(...produccionMensual.map(d => d.ordenes), 1);

  const reportesFiltrados = reportes.filter((r: ProduccionRep) =>
    (FILTROS_EFICIENCIA.find(f => f.value === filtroEficiencia)?.test(r.eficiencia) ?? true) &&
    (r.taller.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    totalTalleres: reportes.length,
    ordenesCompletadas: reportes.reduce((sum, r) => sum + r.ordenesCompletadas, 0),
    ordenesPendientes: reportes.reduce((sum, r) => sum + r.ordenesPendientes, 0),
    eficienciaPromedio: reportes.length > 0 ? Math.round(reportes.reduce((sum, r) => sum + r.eficiencia, 0) / reportes.length) : 0,
    prendasTotales: reportes.reduce((sum, r) => sum + (r.prendasProducidas ?? 0), 0),
    valorTotal: reportes.reduce((sum, r) => sum + (r.valorProduccion ?? 0), 0),
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 90) return s.eficienciaAlta;
    if (eficiencia >= 75) return s.eficienciaMedia;
    return s.eficienciaBaja;
  };

  if (loading) {
    return <div className={s.header}><p>Cargando reporte de producción...</p></div>;
  }

  if (error) {
    return <div className={s.header}><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Reportes de Producción</h1>
          <p className={s.pageSubtitle}>Análisis de producción</p>
        </div>
        <div className={s.headerActions}>
          <div className={s.periodoSelect}>
            <select className={s.select} defaultValue="ultimos_6_meses">
              {PERIODOS_REPORTE_VENTAS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className={s.selectIcon} />
          </div>
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Exportar
          </Button>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <Factory size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{stats.totalTalleres}</div>
            <div className={s.statLabel}>Talleres Activos</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardSuccess}`}>
          <CheckCircle size={20} className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{stats.ordenesCompletadas}</div>
            <div className={s.statLabel}>Órdenes Completadas</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardWarning}`}>
          <Clock size={20} className={s.statIconWarning} />
          <div>
            <div className={s.statValue}>{stats.ordenesPendientes}</div>
            <div className={s.statLabel}>Órdenes Pendientes</div>
          </div>
        </div>
        <div className={s.statCard}>
          <TrendingUp size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{stats.eficienciaPromedio}%</div>
            <div className={s.statLabel}>Eficiencia Promedio</div>
          </div>
        </div>
        <div className={s.statCard}>
          <Package size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{stats.prendasTotales.toLocaleString('es-CO')}</div>
            <div className={s.statLabel}>Prendas Producidas</div>
          </div>
        </div>
      </div>

      <div className={s.chartSection}>
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>
              <BarChart3 size={18} className={s.chartIcon} />
              Producción Mensual (Órdenes Completadas vs Pendientes)
            </h3>
          </div>
          <div className={s.barChartContainer}>
            <div className={s.barChartYAxis}>
              <span>{maxOrdenes}</span>
              <span>{Math.round(maxOrdenes * 0.75)}</span>
              <span>{Math.round(maxOrdenes * 0.5)}</span>
              <span>{Math.round(maxOrdenes * 0.25)}</span>
              <span>0</span>
            </div>
            <div className={s.barChart}>
              {produccionMensual.map((d: { mes: string; ordenes: number; completadas: number; pendientes: number }) => (
                <div key={d.mes} className={s.barGroup}>
                  <div className={s.barStacked}>
                    <div
                      className={`${s.barFill} ${s.barCompletadas}`}
                      style={{ height: `${(d.completadas / maxOrdenes) * 100}%` }}
                    />
                    <div
                      className={`${s.barFill} ${s.barPendientes}`}
                      style={{ height: `${(d.pendientes / maxOrdenes) * 100}%` }}
                    />
                  </div>
                  <div className={s.barLabelBottom}>
                    <span className={s.barMes}>{d.mes}</span>
                    <span className={s.barTotal}>{d.ordenes} órds</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={s.chartLegend}>
            <div className={s.legendItem}>
              <div className={`${s.legendDot} ${s.legendCompletadas}`} />
              <span>Completadas</span>
            </div>
            <div className={s.legendItem}>
              <div className={`${s.legendDot} ${s.legendPendientes}`} />
              <span>Pendientes</span>
            </div>
          </div>
        </div>

        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>
              <Factory size={18} className={s.chartIcon} />
              Órdenes recientes
            </h3>
          </div>
          <div className={s.tallerChart}>
            {report?.recentOrders && report.recentOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--color-text-primary)' }}>
                    <span>{order.referencia}</span>
                    <span>{order.estado}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>Sin información disponible</p>
            )}
          </div>
        </div>
      </div>

      <div className={s.tableSection}>
        <div className={s.tableHeader}>
          <h3 className={s.tableTitle}>Reporte por Taller</h3>
          <div className={s.tableFilters}>
            <div className={s.filterGroup}>
              {FILTROS_EFICIENCIA.map(f => (
                <button
                  key={f.value}
                  className={`${s.filterBtn} ${filtroEficiencia === f.value ? s.filterBtnActive : ''}`}
                  onClick={() => setFiltroEficiencia(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={s.searchBox}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Buscar taller..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={s.searchInput}
              />
            </div>
          </div>
        </div>

        <DataTable<ProduccionRep>
          data={reportesFiltrados}
          pageSize={10}
          emptyMessage="Sin resultados"
          maxVisibleColumns={5}
          detailPanel={{
            title: (r) => r.taller,
            render: (r) => (
              <div>
                <div className={s.detailSection}>
                  <h4 className={s.detailSectionTitle}>Rendimiento del taller</h4>
                  <div className={s.detailGrid}>
                    <div className={s.detailItem}><span className={s.detailLabel}>Completadas</span><span className={s.tdSuccess}>{r.ordenesCompletadas}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Pendientes</span><span>{r.ordenesPendientes}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Eficiencia</span><span>{r.eficiencia}%</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Prendas</span><span>{r.prendasProducidas !== null ? r.prendasProducidas.toLocaleString('es-CO') : '—'}</span></div>
                  </div>
                </div>
                <div className={s.detailSection}>
                  <h4 className={s.detailSectionTitle}>Financiero</h4>
                  <div className={s.detailGrid}>
                    <div className={s.detailItem}><span className={s.detailLabel}>Valor Producción</span><span className={s.tdBold}>{r.valorProduccion !== null ? formatCurrency(r.valorProduccion) : '—'}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Promedio Días</span><span>{r.promedioDias !== null ? `${r.promedioDias} días` : '—'}</span></div>
                  </div>
                </div>
              </div>
            ),
          }}
          columns={[
            { key: 'taller', header: 'Taller', sortable: true, render: (r) => <span className={s.tdPrimary}>{r.taller}</span> },
            { key: 'ordenesCompletadas', header: 'Completadas', width: '120px', sortable: true, render: (r) => (
              <span className={`${s.tdCenter} ${s.tdSuccess}`}>{r.ordenesCompletadas}</span>
            )},
            { key: 'eficiencia', header: 'Eficiencia', width: '140px', sortable: true, render: (r) => (
              <div className={s.eficienciaCell}>
                <div className={s.eficienciaBar}>
                  <div
                    className={`${s.eficienciaFill} ${getEficienciaColor(r.eficiencia)}`}
                    style={{ width: `${r.eficiencia}%` }}
                  />
                </div>
                <span className={`${s.eficienciaText} ${getEficienciaColor(r.eficiencia)}`}>
                  {r.eficiencia}%
                </span>
              </div>
            )},
            { key: 'prendasProducidas', header: 'Prendas', width: '110px', sortable: true, render: (r) => (
              <span className={s.tdCenter}>{r.prendasProducidas !== null ? r.prendasProducidas.toLocaleString('es-CO') : '—'}</span>
            )},
            { key: 'valorProduccion', header: 'Valor Prod.', width: '140px', sortable: true, render: (r) => (
              <span className={`${s.tdRight} ${s.tdBold}`}>{r.valorProduccion !== null ? formatCurrency(r.valorProduccion) : '—'}</span>
            )},
          ]}
        />
      </div>
    </div>
  );
}
