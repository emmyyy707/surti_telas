import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, MapPin, Clock, Package } from 'lucide-react';
import s from './Historial.module.css';
import { Badge } from '@/shared/ui/Badge';
import { DetailModal } from '@/shared/ui/DetailModal';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { useAuthStore } from '@/core/stores/authStore';

interface Entrega {
  id: string;
  pedido: string;
  cliente: string;
  direccion: string;
  fecha: string;
  hora: string;
  estado: 'Entregado' | 'Fallido';
  observaciones: string;
}

export const DomiciliarioHistorial: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [desde, setDesde] = useState('2026-06-01');
  const [hasta, setHasta] = useState('2026-06-08');
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await ordersApi.list({ asesorId: user?.uid });
        const mapped: Entrega[] = result.pedidos
          .filter((p) => p.estado === 'Entregado' || p.estado === 'Cancelado')
          .map((p) => ({
            id: p.id,
            pedido: p.id,
            cliente: p.cliente,
            direccion: '',
            fecha: p.fecha,
            hora: '',
            estado: p.estado === 'Entregado' ? 'Entregado' : 'Fallido',
            observaciones: p.observaciones || '',
          }));
        setEntregas(mapped);
      } catch {
        toast.error('No se pudo cargar el historial');
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) void load();
  }, [user?.uid]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Entrega[]> = {};
    entregas.forEach((e) => {
      if (!groups[e.fecha]) groups[e.fecha] = [];
      groups[e.fecha].push(e);
    });
    return groups;
  }, [entregas]);

  const filteredHistorial = useMemo(() => {
    const desdeDate = new Date(`${desde}T00:00:00`).getTime();
    const hastaDate = new Date(`${hasta}T23:59:59`).getTime();

    const result: Record<string, Entrega[]> = {};
    Object.entries(groupedByDate).forEach(([fecha, ents]) => {
      const parsed = new Date(fecha.replace(/(\d{2}) (\w+) (\d{4})/, (_, d, m, y) => {
        const monthMap: Record<string, string> = { Ene:'01', Feb:'02', Mar:'03', Abr:'04', May:'05', Jun:'06', Jul:'07', Ago:'08', Sep:'09', Oct:'10', Nov:'11', Dic:'12' };
        return `${y}-${monthMap[m] || '01'}-${d}`;
      })).getTime();
      if (!Number.isNaN(parsed) && parsed >= desdeDate && parsed <= hastaDate) {
        result[fecha] = ents;
      }
    });
    return result;
  }, [desde, hasta, groupedByDate]);

  const totalEntregas = entregas.length;
  const exitosas = entregas.filter((e) => e.estado === 'Entregado').length;
  const fallidas = entregas.filter((e) => e.estado === 'Fallido').length;
  const tasaExito = totalEntregas > 0 ? Math.round((exitosas / totalEntregas) * 100) : 0;

  const rendimientoCards = [
    { value: String(totalEntregas), label: 'Total Entregas', sub: 'Desde inicio', color: 'default' as const },
    { value: `${tasaExito}%`, label: 'Tasa de Éxito', sub: `${exitosas} exitosas`, color: 'success' as const },
    { value: String(fallidas), label: 'Fallidas Total', sub: `${totalEntregas > 0 ? Math.round((fallidas / totalEntregas) * 100) : 0}% del total`, color: 'error' as const },
    { value: '—', label: 'Calificación', sub: 'Promedio clientes', color: 'default' as const },
  ];

  if (loading) {
    return (
      <div>
        <h1 className={s.pageTitle}>Historial</h1>
        <p className={s.pageSubtitle}>Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Historial</h1>
      <p className={s.pageSubtitle}>Registro de todas tus entregas</p>

      <div className={s.rendimientoGrid}>
        {rendimientoCards.map((r, i) => (
          <div key={i} className={s.rendimientoCard}>
            <div className={`${s.rendimientoValue} ${r.color === 'success' ? s.rendimientoValueSuccess : r.color === 'error' ? s.rendimientoValueError : ''}`}>
              {r.value}
            </div>
            <div className={s.rendimientoLabel}>{r.label}</div>
            <div className={s.rendimientoSub}>{r.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.historialFilters}>
        <div className={s.dateRangeGroup}>
          <span className={s.dateRangeLabel}>Desde:</span>
          <input type="date" className={s.dateInput} value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div className={s.dateRangeGroup}>
          <span className={s.dateRangeLabel}>Hasta:</span>
          <input type="date" className={s.dateInput} value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
      </div>

      {Object.keys(filteredHistorial).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-text-muted)]">
          No hay entregas en el rango seleccionado.
        </div>
      ) : (
        Object.entries(filteredHistorial).map(([date, entregas]) => (
          <div key={date} className={s.dayGroup}>
            <div className={s.dayGroupHeader}>
              <span className={s.dayGroupDate}>{date}</span>
              <div className={s.dayGroupLine} />
              <span className={s.dayGroupCount}>{entregas.length} entregas</span>
            </div>
            {entregas.map((entrega) => (
              <button type="button" key={entrega.id} className={s.historialRow} onClick={() => setSelectedEntrega(entrega)}>
                <span className={s.historialRowId}>{entrega.id}</span>
                <span style={{ flex: 0.8 }}>{entrega.pedido}</span>
                <div className={s.historialRowCliente}>
                  <div className={s.historialRowClienteName}>{entrega.cliente}</div>
                  <div className={s.historialRowAddress}>{entrega.direccion}</div>
                </div>
                <span className={s.historialRowHora}>{entrega.hora}</span>
                <Badge variant={entrega.estado === 'Entregado' ? 'success' : 'danger'}>
                  {entrega.estado}
                </Badge>
                <span className={s.historialRowObs}>{entrega.observaciones || '-'}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <Eye size={14} />
                </span>
              </button>
            ))}
          </div>
        ))
      )}

      <div style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Mostrando {Object.values(filteredHistorial).flat().length} entregas filtradas.
      </div>

      <DetailModal
        children={null}
        open={Boolean(selectedEntrega)}
        onClose={() => setSelectedEntrega(null)}
        title={selectedEntrega ? `Historial ${selectedEntrega.id}` : 'Historial'}
        subtitle={selectedEntrega?.fecha}
        size="lg"
        header={{
          icon: <Eye size={18} />,
          status: selectedEntrega ? <Badge variant={selectedEntrega.estado === 'Entregado' ? 'success' : 'danger'}>{selectedEntrega.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Detalle de entrega',
            fields: [
              { label: 'Pedido', value: selectedEntrega?.pedido, icon: <Package size={16} /> },
              { label: 'Cliente', value: selectedEntrega?.cliente, icon: <Eye size={16} /> },
              { label: 'Dirección', value: selectedEntrega?.direccion, icon: <MapPin size={16} /> },
              { label: 'Fecha', value: selectedEntrega?.fecha, icon: <Clock size={16} /> },
              { label: 'Hora', value: selectedEntrega?.hora, icon: <Clock size={16} /> },
              { label: 'Observaciones', value: selectedEntrega?.observaciones || 'Sin observaciones', fullWidth: true, icon: <Eye size={16} /> },
            ],
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="inline-flex h-8 items-center justify-center rounded-xl border border-[var(--color-border)] bg-transparent px-4 text-sm font-medium text-[var(--color-text-primary)]" onClick={() => {
              toast.info(`Historial ${selectedEntrega?.id} listo para consulta`);
              setSelectedEntrega(null);
            }}>
              Cerrar
            </button>
          </div>
        }
      />
    </div>
  );
};
