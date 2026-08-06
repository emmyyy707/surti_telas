import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Download } from 'lucide-react';
import s from './AdminFinanzas.module.css';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { financialApi, type FinancialReport } from '@/infrastructure/api/financialApi';
import { formatCurrency, cn } from '@/shared/utils';

export const AdminFinanzas: React.FC = () => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const fetchReport = async (filters?: { desde?: string; hasta?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await financialApi.getReport(filters);
      setReport(data);
    } catch {
      setError('No se pudo cargar el reporte financiero');
      toast.error('No se pudo cargar el reporte financiero');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReport();
  }, []);

  const handleFilter = () => {
    void fetchReport({
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
  };

  const handleExport = () => {
    if (!report) return;
    const csvContent = [
      ['Concepto', 'Valor'].join(','),
      ['Ingresos Totales', report.ingresosTotales].join(','),
      ['Gastos Totales', report.gastosTotales].join(','),
      ['Utilidad Neta', report.utilidadNeta].join(','),
      ['Margen de Utilidad', `${report.margenUtilidad}%`].join(','),
      ['Flujo de Caja', report.flujoCaja].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-financiero-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado');
  };

  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Finanzas</h1>
            <p className={s.pageSubtitle}>Reporte financiero consolidado</p>
          </div>
        </div>
        <div className={s.loading}>Cargando reporte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.container}>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Finanzas</h1>
            <p className={s.pageSubtitle}>Reporte financiero consolidado</p>
          </div>
        </div>
        <div className={s.error}>{error}</div>
        <Button onClick={() => fetchReport({ desde, hasta })}>Reintentar</Button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const kpis = [
    { label: 'Ingresos Totales', value: report.ingresosTotales, icon: TrendingUp, color: 'var(--color-success)' },
    { label: 'Gastos Totales', value: report.gastosTotales, icon: TrendingDown, color: 'var(--color-error)' },
    { label: 'Utilidad Neta', value: report.utilidadNeta, icon: Wallet, color: 'var(--color-accent)' },
    { label: 'Margen de Utilidad', value: `${report.margenUtilidad}%`, icon: DollarSign, color: 'var(--color-accent)' },
    { label: 'Flujo de Caja', value: report.flujoCaja, icon: TrendingUp, color: 'var(--color-info)' },
  ];

  const iconClassName = (label: string) => {
    if (label.includes('Ingresos')) return s.kpiIconSuccess;
    if (label.includes('Gastos')) return s.kpiIconDanger;
    if (label.includes('Utilidad')) return s.kpiIconInfo;
    if (label.includes('Margen')) return s.kpiIconPurple;
    if (label.includes('Flujo')) return s.kpiIconCyan;
    return s.kpiIcon;
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Finanzas</h1>
          <p className={s.pageSubtitle}>Reporte financiero consolidado</p>
        </div>
        <Button onClick={handleExport} leftIcon={<Download size={16} />} variant="secondary">
          Exportar CSV
        </Button>
      </div>

      <div className={s.filters}>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Desde</label>
          <input
            type="date"
            className={s.filterInput}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Hasta</label>
          <input
            type="date"
            className={s.filterInput}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <Button onClick={handleFilter} leftIcon={<Calendar size={16} />}>
          Aplicar filtro
        </Button>
      </div>

      <div className={s.kpiGrid}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={s.kpiCard}>
              <div className={s.kpiHeader}>
                <span className={s.kpiLabel}>{kpi.label}</span>
                <div className={cn(s.kpiIcon, iconClassName(kpi.label))}>
                  <Icon size={20} />
                </div>
              </div>
              <div className={s.kpiValue} style={{ color: kpi.color }}>
                {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
              </div>
            </Card>
          );
        })}
      </div>

      <div className={s.sections}>
        <Card className={s.section}>
          <div className={s.sectionHeader}>
            <h3 className={s.sectionTitle}>Resumen</h3>
            <Badge variant="default">Consolidado</Badge>
          </div>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Ingresos</span>
            <Badge variant="success" className={s.summaryBadge}>{formatCurrency(report.ingresosTotales)}</Badge>
          </div>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Gastos</span>
            <Badge variant="danger" className={s.summaryBadge}>{formatCurrency(report.gastosTotales)}</Badge>
          </div>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Utilidad Neta</span>
            <Badge variant="default" className={s.summaryBadge}>{formatCurrency(report.utilidadNeta)}</Badge>
          </div>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Margen</span>
            <Badge variant="default" className={s.summaryBadge}>{report.margenUtilidad}%</Badge>
          </div>
        </Card>

        <Card className={s.section}>
          <div className={s.sectionHeader}>
            <h3 className={s.sectionTitle}>Flujo de Caja</h3>
            <Badge variant={report.flujoCaja >= 0 ? 'success' : 'danger'} className={s.summaryBadge}>
              {report.flujoCaja >= 0 ? 'Positivo' : 'Negativo'}
            </Badge>
          </div>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Flujo Neto</span>
            <Badge variant={report.flujoCaja >= 0 ? 'success' : 'danger'} className={s.summaryBadge}>
              {formatCurrency(report.flujoCaja)}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
