import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Map, MapPin, Clock, CheckCircle2, Navigation } from 'lucide-react';
import s from './RutaDelDia.module.css';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { DetailModal } from '@/shared/ui/DetailModal';
import { deliveriesApi } from '@/infrastructure/api/deliveriesApi';
import { useAuthStore } from '@/core/stores/authStore';

interface Entrega {
  id: string;
  cliente: string;
  direccion: string;
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

const statusVariant = (estado: Entrega['estado']) => {
  if (estado === 'Entregado') return 'success';
  if (estado === 'En camino') return 'info';
  if (estado === 'Fallido') return 'danger';
  return 'warning';
};

export const RutaDelDia: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [statusEntrega, setStatusEntrega] = useState<Entrega | null>(null);
  const [nextEstado, setNextEstado] = useState<Entrega['estado']>('Pendiente');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await deliveriesApi.list(user?.uid ? { domiciliarioId: user.uid } : undefined);
        const mapped: Entrega[] = result.map((d) => ({
          id: d.orderId || d.id,
          cliente: d.clienteNombre || '',
          direccion: d.direccion || '',
          barrio: d.ciudad || '',
          horaEstimada: d.asignadoEn ? new Date(d.asignadoEn).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          estado: deliveryStatusMap[d.estado] || 'Pendiente',
        }));
        setEntregas(mapped);
      } catch {
        toast.error('No se pudieron cargar las entregas');
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) void load();
  }, [user?.uid]);

  const completed = entregas.filter(e => e.estado === 'Entregado').length;
  const pending = entregas.length - completed;

  const pins = useMemo(() => entregas.slice(0, 5).map((entrega, index) => ({
    entrega,
    index,
    top: 60 + index * 80,
    left: [80, 200, 150, 260, 120][index],
  })), [entregas]);

  const openStatus = (entrega: Entrega) => {
    setStatusEntrega(entrega);
    setNextEstado(entrega.estado === 'Pendiente' ? 'En camino' : entrega.estado === 'En camino' ? 'Entregado' : 'Fallido');
  };

  const saveStatus = async () => {
    if (!statusEntrega) return;
    try {
      const backendEstado = nextEstado === 'Pendiente' ? 'ASIGNADO' : nextEstado === 'En camino' ? 'EN_RUTA' : nextEstado === 'Entregado' ? 'ENTREGADO' : 'FALLIDO';
      await deliveriesApi.updateStatus(statusEntrega.id, backendEstado);
      setEntregas(prev => prev.map(entrega => entrega.id === statusEntrega.id ? { ...entrega, estado: nextEstado } : entrega));
      setSelectedEntrega(prev => prev?.id === statusEntrega.id ? { ...prev, estado: nextEstado } : prev);
      toast.success(`${statusEntrega.id} marcada como ${nextEstado}`);
      setStatusEntrega(null);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const optimizarRuta = () => {
    setEntregas(prev => {
      const orden: Record<Entrega['estado'], number> = { 'Pendiente': 0, 'En camino': 1, 'Fallido': 2, 'Entregado': 3 };
      return [...prev].sort((a, b) => orden[a.estado] - orden[b.estado] || a.horaEstimada.localeCompare(b.horaEstimada));
    });
    toast.success('Ruta optimizada: pendientes primero, entregados al final');
  };

  const irAEntrega = (entrega: Entrega) => {
    const query = encodeURIComponent(`${entrega.direccion}, ${entrega.barrio}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener');
  };

  if (loading) {
    return (
      <div>
        <h1 className={s.pageTitle}>Ruta del Día</h1>
        <p className={s.pageSubtitle}>Cargando entregas...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Ruta del Día</h1>
      <p className={s.pageSubtitle}>{entregas.length} entregas programadas</p>

      <div className={s.rutaLayout}>
        <div className={s.rutaPanel}>
          <div className={s.rutaPanelHeader}>
            <div className={s.rutaPanelTitle}>Secuencia de paradas</div>
            <div className={s.rutaResumen}>
              <span className={`${s.rutaResumenChip} ${s.rutaResumenChipTotal}`}>{entregas.length}</span>
              <span className={`${s.rutaResumenChip} ${s.rutaResumenChipDone}`}>{completed}</span>
              <span className={`${s.rutaResumenChip} ${s.rutaResumenChipPending}`}>{pending}</span>
            </div>
          </div>

          <div className={s.rutaTimeline}>
            {entregas.map((entrega, i) => (
              <button type="button" key={entrega.id} className={`${s.rutaStop} ${selectedEntrega?.id === entrega.id ? s.rutaStopActive : ''} ${entrega.estado === 'Entregado' ? s.rutaStopDone : ''}`} onClick={() => setSelectedEntrega(entrega)}>
                <div className={s.rutaStopLeft}>
                  <div className={s.rutaStopNumber}>{i + 1}</div>
                  <div className={s.rutaStopLine} />
                </div>
                <div className={s.rutaStopBody}>
                  <div className={s.rutaStopCliente}>{entrega.cliente}</div>
                  <div className={s.rutaStopDireccion}>{entrega.direccion}, {entrega.barrio}</div>
                  <div className={s.rutaStopFooter}>
                    <span className={s.rutaStopHora}>{entrega.horaEstimada}</span>
                    <Badge variant={statusVariant(entrega.estado)}>{entrega.estado}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={s.mapPanel}>
          <div className={s.mapHeader}>
            <div className={s.mapTitle}>Mapa de ruta</div>
            <Button size="sm" variant="secondary" onClick={optimizarRuta}>Optimizar ruta</Button>
          </div>
          <div className={s.mapPlaceholder}>
            <div className={s.mapGrid} />
            <div className={s.mapIcon}>
              <Map size={48} />
            </div>
            <div className={s.mapText}>
              Vista de mapa integrada disponible en la app móvil
            </div>

            {pins.map(({ entrega, index, top, left }) => (
              <button type="button" key={entrega.id} style={{ position: 'absolute', top, left }} className={s.mapPin} onClick={() => setSelectedEntrega(entrega)}>
                <div className={`${s.mapPinDot} ${entrega.estado === 'Entregado' ? s.mapPinDotDone : entrega.estado === 'En camino' ? s.mapPinDotActive : ''}`}><span className={s.mapPinLabel}>{index + 1}</span></div>
                <div className={s.mapPinShadow} />
              </button>
            ))}

            {selectedEntrega && (
              <div className={s.mapDetailCard}>
                <div className={s.mapDetailInfo}>
                  <div className={s.mapDetailName}>{selectedEntrega.cliente}</div>
                  <div className={s.mapDetailAddress}>{selectedEntrega.direccion}, {selectedEntrega.barrio}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => irAEntrega(selectedEntrega)}>
                    <Navigation size={14} />
                    Ir a entrega
                  </Button>
                  {selectedEntrega.estado !== 'Entregado' && (
                    <Button size="sm" variant="secondary" onClick={() => openStatus(selectedEntrega)}>
                      <CheckCircle2 size={14} />
                      Avanzar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailModal
        children={null}
        open={Boolean(selectedEntrega)}
        onClose={() => setSelectedEntrega(null)}
        title={selectedEntrega ? `Ruta ${selectedEntrega.id}` : 'Ruta'}
        subtitle={selectedEntrega?.horaEstimada}
        header={{
          icon: <MapPin size={18} />,
          status: selectedEntrega ? <Badge variant={statusVariant(selectedEntrega.estado)}>{selectedEntrega.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Parada seleccionada',
            fields: [
              { label: 'Cliente', value: selectedEntrega?.cliente, icon: <MapPin size={16} /> },
              { label: 'Dirección', value: selectedEntrega?.direccion, icon: <MapPin size={16} /> },
              { label: 'Barrio', value: selectedEntrega?.barrio, icon: <MapPin size={16} /> },
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
        title="Actualizar parada de ruta"
        subtitle={statusEntrega ? `${statusEntrega.id} - ${statusEntrega.cliente}` : undefined}
        sections={[
          {
            title: 'Estado de entrega',
            children: (
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Estado
                <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={nextEstado} onChange={e => setNextEstado(e.target.value as Entrega['estado'])}>
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
            <Button onClick={saveStatus}>Guardar avance</Button>
          </div>
        }
      />
    </div>
  );
};