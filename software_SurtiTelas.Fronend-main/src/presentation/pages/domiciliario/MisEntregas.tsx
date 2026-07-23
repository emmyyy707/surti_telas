import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, CheckCircle2, MapPin, Clock, Package } from 'lucide-react';
import s from './MisEntregas.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DetailModal } from '@/shared/ui/DetailModal';
import { deliveriesApi } from '@/infrastructure/api/deliveriesApi';
import { useAuthStore } from '@/core/stores/authStore';

interface Entrega {
  id: string;
  pedido: string;
  cliente: string;
  direccion: string;
  ciudad: string;
  barrio: string;
  horaEstimada: string;
  estado: 'Pendiente' | 'En camino' | 'Entregado' | 'Fallido';
}

const deliveryStatusMap: Record<string, Entrega['estado']> = {
  'ENTREGADO': 'Entregado',
  'EN_RUTA': 'En camino',
  'ASIGNADO': 'Pendiente',
  'FALLIDO': 'Fallido',
};

const deliveryStatusVariant: Record<Entrega['estado'], 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  'Pendiente': 'warning',
  'En camino': 'info',
  'Entregado': 'success',
  'Fallido': 'danger',
};

export const DomiciliarioEntregas: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Entrega['estado'] | 'Todas'>('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [statusEntrega, setStatusEntrega] = useState<Entrega | null>(null);
  const [nextEstado, setNextEstado] = useState<Entrega['estado']>('Pendiente');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await deliveriesApi.list(user?.uid ? { domiciliarioId: user.uid } : undefined);
        const mapped: Entrega[] = result.map((d) => ({
          id: d.orderId || d.id,
          pedido: d.orderId || d.id,
          cliente: d.clienteNombre || '',
          direccion: d.direccion || '',
          ciudad: d.ciudad || '',
          barrio: d.ciudad || '',
          horaEstimada: d.asignadoEn ? new Date(d.asignadoEn).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          estado: deliveryStatusMap[d.estado] || 'Pendiente',
        }));
        setEntregas(mapped);
      } catch {
        setError('No se pudieron cargar las entregas');
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) void load();
  }, [user?.uid]);

  const filteredEntregas = useMemo(() => {
    if (activeFilter === 'Todas') return entregas;
    return entregas.filter((entrega) => entrega.estado === activeFilter);
  }, [entregas, activeFilter]);

  const counts = {
    Todas: entregas.length,
    Pendiente: entregas.filter((e) => e.estado === 'Pendiente').length,
    'En camino': entregas.filter((e) => e.estado === 'En camino').length,
    Entregado: entregas.filter((e) => e.estado === 'Entregado').length,
  };

  const openStatus = (entrega: Entrega) => {
    setStatusEntrega(entrega);
    setNextEstado(entrega.estado === 'Pendiente' ? 'En camino' : entrega.estado === 'En camino' ? 'Entregado' : 'Fallido');
  };

  const saveStatus = async () => {
    if (!statusEntrega) return;
    try {
      const backendEstado = nextEstado === 'Pendiente' ? 'ASIGNADO' : nextEstado === 'En camino' ? 'EN_RUTA' : nextEstado === 'Entregado' ? 'ENTREGADO' : 'FALLIDO';
      await deliveriesApi.updateStatus(statusEntrega.id, backendEstado);
      setEntregas((prev) => prev.map((entrega) => entrega.id === statusEntrega.id ? { ...entrega, estado: nextEstado } : entrega));
      toast.success(`${statusEntrega.id} marcada como ${nextEstado}`);
      setStatusEntrega(null);
    } catch {
      toast.error('No se pudo actualizar el estado de la entrega');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className={s.pageTitle}>Entregas de Hoy</h1>
        <p className={s.pageSubtitle}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className={s.pageTitle}>Entregas de Hoy</h1>
        <p className={s.pageSubtitle}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Entregas de Hoy</h1>
      <p className={s.pageSubtitle}>Gestión de tus entregas del día</p>

      <div className={s.filterBar}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['Todas', 'Pendiente', 'En camino', 'Entregado'] as const).map((filtro) => (
            <button
              key={filtro}
              className={`${s.filterBtn} ${activeFilter === filtro ? s.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(filtro)}
            >
              <span>{filtro}</span>
              <span className={s.filterCount}>{counts[filtro]}</span>
            </button>
          ))}
        </div>
        <div className={s.viewToggle}>
          <button className={`${s.viewToggleBtn} ${viewMode === 'grid' ? s.viewToggleBtnActive : ''}`} onClick={() => setViewMode('grid')}>⊡</button>
          <button className={`${s.viewToggleBtn} ${viewMode === 'list' ? s.viewToggleBtnActive : ''}`} onClick={() => setViewMode('list')}>☰</button>
        </div>
      </div>

      <div className={`${s.entregasGrid} ${viewMode === 'list' ? s.entregasGridList : ''}`}>
        {filteredEntregas.map((entrega) => (
          <div key={entrega.id} className={`${s.entregaCard} ${entrega.estado === 'Entregado' ? s.entregaCardEntregado : entrega.estado === 'En camino' ? s.entregaCardEncamino : entrega.estado === 'Fallido' ? s.entregaCardFallido : s.entregaCardPendiente}`}>
            <div className={s.entregaCardHeader}>
              <div className={s.entregaNumero}>
                <div className={s.entregaNumeroCircle}>{entrega.id.split('-')[1]}</div>
              </div>
              <Badge variant={deliveryStatusVariant[entrega.estado]}>
                {entrega.estado}
              </Badge>
            </div>
            <div className={s.entregaCardBody}>
              <div className={s.entregaCliente}>{entrega.cliente}</div>
              <div className={s.entregaDireccion}>{entrega.direccion} - {entrega.barrio}</div>
              <div className={s.entregaMetaRow}>
                <div className={s.entregaMeta}>
                  <div className={s.entregaMetaLabel}>Pedido</div>
                  <div className={s.entregaMetaValue}>{entrega.pedido}</div>
                </div>
                <div className={s.entregaMeta}>
                  <div className={s.entregaMetaLabel}>Hora</div>
                  <div className={s.entregaMetaValue}>{entrega.horaEstimada}</div>
                </div>
              </div>
            </div>
            <div className={s.entregaCardFooter}>
              <Button size="sm" style={{ flex: 1 }} onClick={() => setSelectedEntrega(entrega)}>
                <Eye size={14} />
                Ver detalle
              </Button>
              {entrega.estado !== 'Entregado' && (
                <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => openStatus(entrega)}>
                  <CheckCircle2 size={14} />
                  Cambiar estado
                </Button>
              )}
            </div>
          </div>
        ))}
        {filteredEntregas.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-text-muted)]">
            No hay entregas en este filtro.
          </div>
        )}
      </div>

      <DetailModal
        children={null}
        open={Boolean(selectedEntrega)}
        onClose={() => setSelectedEntrega(null)}
        title={selectedEntrega ? `Entrega ${selectedEntrega.id}` : 'Entrega'}
        subtitle={selectedEntrega?.horaEstimada}
        size="lg"
        header={{
          icon: <MapPin size={18} />,
          status: selectedEntrega ? <Badge variant={deliveryStatusVariant[selectedEntrega.estado]}>{selectedEntrega.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Información de entrega',
            fields: [
              { label: 'Cliente', value: selectedEntrega?.cliente, icon: <Package size={16} /> },
              { label: 'Pedido', value: selectedEntrega?.pedido, icon: <Package size={16} /> },
              { label: 'Dirección', value: selectedEntrega?.direccion, icon: <MapPin size={16} /> },
              { label: 'Barrio', value: selectedEntrega?.barrio, icon: <MapPin size={16} /> },
              { label: 'Ciudad', value: selectedEntrega?.ciudad, icon: <MapPin size={16} /> },
              { label: 'Hora estimada', value: selectedEntrega?.horaEstimada, icon: <Clock size={16} /> },
            ],
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedEntrega(null)}>Cerrar</Button>
            {selectedEntrega && selectedEntrega.estado !== 'Entregado' && (
              <Button onClick={() => { setSelectedEntrega(null); openStatus(selectedEntrega); }}>Cambiar estado</Button>
            )}
          </div>
        }
      />

      <DetailModal
        children={null}
        open={Boolean(statusEntrega)}
        onClose={() => setStatusEntrega(null)}
        title="Cambiar estado de entrega"
        subtitle={statusEntrega ? `${statusEntrega.id} - ${statusEntrega.cliente}` : undefined}
        sections={[
          {
            title: 'Nuevo estado',
            children: (
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Estado
                <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={nextEstado} onChange={(e) => setNextEstado(e.target.value as Entrega['estado'])}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En camino">En camino</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Fallido">Fallido</option>
                </select>
              </label>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStatusEntrega(null)}>Cancelar</Button>
            <Button onClick={saveStatus}>Aplicar estado</Button>
          </div>
        }
      />
    </div>
  );
};