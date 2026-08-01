import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Download, DollarSign, ShoppingBag, Users, TrendingUp,
  Package, Truck, Clock, AlertTriangle, Loader2,
  Filter, RefreshCw, FileSpreadsheet,
} from 'lucide-react';
import s from './DashboardAnalitico.module.css';
import { Button } from '@/shared/ui/Button';
import { analyticsApi, type KPIData, type ComparisonResult } from '@/infrastructure/api/analyticsApi';
import { exportApi } from '@/infrastructure/api/exportApi';
import { PERIODOS_REPORTE_VENTAS } from '@/shared/constants/options';

export const AdminDashboardAnalitico: React.FC = () => {
  const [periodo, setPeriodo] = useState('ultimos_6_meses');
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, compData] = await Promise.all([
        analyticsApi.getDashboard({ desde: periodo }),
        analyticsApi.getComparison({ desde: periodo }),
      ]);
      setKpis(kpiData);
      setComparison(compData);
    } catch {
      setError('No se pudo cargar el dashboard');
      toast.error('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (!kpis) return;
    try {
      const data = {
        format,
        data: [
          { metric: 'Total Pedidos', value: kpis.totalPedidos },
          { metric: 'Total Ventas', value: kpis.totalVentas },
          { metric: 'Total Clientes', value: kpis.totalClientes },
          { metric: 'Ingresos Totales', value: kpis.ingresosTotales },
          { metric: 'Ticket Promedio', value: kpis.ticketPromedio },
        ],
        filename: `dashboard-${new Date().toISOString().slice(0, 10)}`,
        columns: [{ key: 'metric', header: 'Metrica' }, { key: 'value', header: 'Valor' }],
      };
      const blob = await exportApi.exportData(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename + '.' + format;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exportado correctamente');
    } catch {
      toast.error('Error al exportar');
    }
  };

  if (loading) {
    return (
      <div className={s.loading}>
        <Loader2 className={s.spinner} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.error}>
        <AlertTriangle size={48} />
        <p>{error}</p>
        <Button onClick={loadData}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h1>Dashboard Analitico</h1>
        <div className={s.actions}>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={s.select}>
            {PERIODOS_REPORTE_VENTAS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FileSpreadsheet size={16} /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet size={16} /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {comparison && (
        <div className={s.comparison}>
          <div className={s.compCard}>
            <span className={s.compLabel}>Periodo Actual</span>
            <span className={s.compValue}>${comparison.currentPeriodo.total.toLocaleString()}</span>
            <span className={s.compSub}>{comparison.currentPeriodo.pedidos} pedidos</span>
          </div>
          <div className={s.compCard}>
            <span className={s.compLabel}>Periodo Anterior</span>
            <span className={s.compValue}>${comparison.previousPeriodo.total.toLocaleString()}</span>
            <span className={s.compSub}>{comparison.previousPeriodo.pedidos} pedidos</span>
          </div>
          <div className={`${s.compCard} ${comparison.crecimiento.porcentaje >= 0 ? s.positive : s.negative}`}>
            <span className={s.compLabel}>Crecimiento</span>
            <span className={s.compValue}>
              {comparison.crecimiento.porcentaje >= 0 ? '+' : ''}{comparison.crecimiento.porcentaje}%
            </span>
            <span className={s.compSub}>
              {comparison.crecimiento.absoluto >= 0 ? '+' : ''}${comparison.crecimiento.absoluto.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {kpis && (
        <>
          <div className={s.kpiGrid}>
            <div className={s.kpiCard}>
              <ShoppingBag size={24} />
              <span className={s.kpiValue}>{kpis.totalPedidos}</span>
              <span className={s.kpiLabel}>Total Pedidos</span>
            </div>
            <div className={s.kpiCard}>
              <DollarSign size={24} />
              <span className={s.kpiValue}>${kpis.ingresosTotales.toLocaleString()}</span>
              <span className={s.kpiLabel}>Ingresos</span>
            </div>
            <div className={s.kpiCard}>
              <Users size={24} />
              <span className={s.kpiValue}>{kpis.totalClientes}</span>
              <span className={s.kpiLabel}>Clientes</span>
            </div>
            <div className={s.kpiCard}>
              <TrendingUp size={24} />
              <span className={s.kpiValue}>${kpis.ticketPromedio.toFixed(0)}</span>
              <span className={s.kpiLabel}>Ticket Promedio</span>
            </div>
          </div>

          <div className={s.section}>
            <h2>Pedidos por Estado</h2>
            <div className={s.barChart}>
              {kpis.pedidosPorEstado.map((item) => (
                <div key={item.estado} className={s.barRow}>
                  <span className={s.barLabel}>{item.estado}</span>
                  <div className={s.barTrack}>
                    <div
                      className={s.barFill}
                      style={{ width: `${(item.cantidad / Math.max(...kpis.pedidosPorEstado.map((x) => x.cantidad))) * 100}%` }} />
                  </div>
                  <span className={s.barValue}>{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.section}>
            <h2>Top Productos</h2>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {kpis.topProductos.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre}</td>
                    <td>{p.cantidad}</td>
                    <td>${p.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={s.section}>
            <h2>Top Clientes</h2>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {kpis.topClientes.map((c, i) => (
                  <tr key={i}>
                    <td>{c.cliente}</td>
                    <td>{c.cantidad}</td>
                    <td>${c.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};


