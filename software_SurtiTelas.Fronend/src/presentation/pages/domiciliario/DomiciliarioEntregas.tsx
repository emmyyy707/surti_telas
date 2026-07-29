import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PackageCheck, MapPin, Phone, User, Filter } from 'lucide-react';
import s from './DomiciliarioEntregas.module.css';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { deliveriesApi, type DeliveryDTO } from '@/infrastructure/api/deliveriesApi';

const ESTADOS = ['ASIGNADO', 'EN_RUTA', 'ENTREGADO', 'FALLIDO'] as const;

export const DomiciliarioEntregas: React.FC = () => {
  const [entregas, setEntregas] = useState<DeliveryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('TODOS');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveriesApi.list();
      setEntregas(data);
    } catch {
      setError('No se pudieron cargar las entregas');
      toast.error('No se pudieron cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const filtradas = useMemo(() => {
    if (filtro === 'TODOS') return entregas;
    return entregas.filter(e => e.estado === filtro);
  }, [entregas, filtro]);

  const cambiarEstado = async (id: string, estado: DeliveryDTO['estado']) => {
    setUpdatingId(id);
    try {
      await deliveriesApi.updateStatus(id, estado);
      setEntregas(prev => prev.map(e => e.id === id ? { ...e, estado } : e));
      toast.success('Estado actualizado');
    } catch {
      toast.error('No se pudo actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const accionesDisponibles = (estado: DeliveryDTO['estado']) => {
    switch (estado) {
      case 'ASIGNADO':
        return [{ label: 'Iniciar entrega', estado: 'EN_RUTA' as const }];
      case 'EN_RUTA':
        return [
          { label: 'Marcar entregado', estado: 'ENTREGADO' as const },
          { label: 'Marcar fallido', estado: 'FALLIDO' as const },
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Entregas de Hoy</h1>
          <p className={s.pageSubtitle}>Tus entregas asignadas y su estado actual</p>
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.filtros}>
          <Filter size={16} />
          <select className={s.selectFiltro} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="TODOS">Todos</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <Button variant="secondary" onClick={cargar} disabled={loading}>Recargar</Button>
      </div>

      {error && <div className={s.error}>{error}</div>}

      {loading ? (
        <div className={s.state}><div className={s.spinner} /> Cargando entregas...</div>
      ) : filtradas.length === 0 ? (
        <div className={s.state}>Sin entregas para este filtro</div>
      ) : (
        <div className={s.grid}>
          {filtradas.map(entrega => (
            <div key={entrega.id} className={s.card}>
              <div className={s.cardHeader}>
                <div>
                  <div className={s.cliente}>{entrega.clienteNombre ?? 'Cliente'}</div>
                  <div className={s.pedido}>Pedido #{entrega.orderNumero ?? entrega.orderId}</div>
                </div>
                <Badge variant={entrega.estado === 'ENTREGADO' ? 'success' : entrega.estado === 'FALLIDO' ? 'danger' : 'warning'}>{entrega.estado}</Badge>
              </div>

              <div className={s.cardBody}>
                <div className={s.row}><MapPin size={14} /> {entrega.direccion ?? 'Sin dirección'} {entrega.ciudad ? `· ${entrega.ciudad}` : ''}</div>
                {entrega.telefono && <div className={s.row}><Phone size={14} /> {entrega.telefono}</div>}
                {entrega.notas && <div className={s.row}><User size={14} /> {entrega.notas}</div>}
              </div>

              <div className={s.cardActions}>
                {accionesDisponibles(entrega.estado).map(accion => (
                  <Button
                    key={accion.estado}
                    size="sm"
                    loading={updatingId === entrega.id}
                    onClick={() => cambiarEstado(entrega.id, accion.estado)}
                  >
                    {accion.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
