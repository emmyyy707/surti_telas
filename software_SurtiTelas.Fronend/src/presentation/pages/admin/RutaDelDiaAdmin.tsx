import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Phone, RefreshCw, User } from 'lucide-react';
import s from './RutaDelDiaAdmin.module.css';
import { Button } from '@/shared/ui/Button';
import { deliveriesApi } from '@/infrastructure/api/deliveriesApi';
import { usersApi } from '@/infrastructure/api/usersApi';
import type { Usuario } from '@/infrastructure/api/usersApi';

export interface DeliveryRutaItem {
  id: string;
  orderId: string;
  estado: 'ASIGNADO' | 'EN_RUTA' | 'ENTREGADO' | 'FALLIDO';
  domiciliarioId?: string | null;
  domiciliarioNombre?: string | null;
  domiciliarioTelefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  notas?: string | null;
  asignadoEn?: string | null;
  entregadoEn?: string | null;
  order?: {
    numero?: string;
    cliente?: string;
    telefono?: string;
    direccion?: string | null;
    ciudad?: string | null;
    total?: number;
  };
}

export const RutaDelDiaAdmin: React.FC = () => {
  const [items, setItems] = useState<DeliveryRutaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [domiciliarios, setDomiciliarios] = useState<Usuario[]>([]);
  const [loadingDomiciliarios, setLoadingDomiciliarios] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await deliveriesApi.rutaDelDia(filterEstado ? { estado: filterEstado } : undefined);
      setItems(result);
    } catch {
      toast.error('No se pudo cargar la ruta del día');
    } finally {
      setLoading(false);
    }
  }, [filterEstado]);

  const loadDomiciliarios = useCallback(async () => {
    setLoadingDomiciliarios(true);
    try {
      const result = await usersApi.list({ role: 'DOMICILIARIO', estado: 'Activo' });
      setDomiciliarios(result);
    } catch {
      toast.error('No se pudieron cargar los domiciliarios');
    } finally {
      setLoadingDomiciliarios(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadDomiciliarios();
  }, [load, loadDomiciliarios]);

  const sync = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Ruta sincronizada');
    } catch {
      toast.error('No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const assignDriver = async (deliveryId: string, domiciliarioId?: string) => {
    setAssigningId(deliveryId);
    try {
      await deliveriesApi.update(deliveryId, { domiciliarioId: domiciliarioId || undefined });
      setItems(prev => prev.map(item => item.id === deliveryId ? { ...item, domiciliarioId: domiciliarioId || undefined, domiciliarioNombre: domiciliarioId ? domiciliarios.find(d => d.id === domiciliarioId)?.nombre ?? undefined : undefined } : item));
      toast.success(domiciliarioId ? 'Domiciliario asignado' : 'Asignación eliminada');
    } catch {
      toast.error('No se pudo asignar el domiciliario');
    } finally {
      setAssigningId(null);
    }
  };

  const changeStatus = async (deliveryId: string, estado: DeliveryRutaItem['estado']) => {
    setStatusUpdatingId(deliveryId);
    try {
      await deliveriesApi.updateStatus(deliveryId, estado);
      setItems(prev => prev.map(item => item.id === deliveryId ? { ...item, estado } : item));
      toast.success('Estado actualizado');
    } catch {
      toast.error('No se pudo actualizar el estado');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const total = items.length;
  const pendientes = items.filter(i => i.estado === 'ASIGNADO').length;
  const enRuta = items.filter(i => i.estado === 'EN_RUTA').length;
  const entregados = items.filter(i => i.estado === 'ENTREGADO').length;
  const fallidos = items.filter(i => i.estado === 'FALLIDO').length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={s.pageTitle}>Ruta del Día</h1>
          <p className={s.pageSubtitle}>Supervisa y administra las entregas del día</p>
        </div>
        <Button size="sm" variant="secondary" onClick={sync} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          Sincronizar
        </Button>
      </div>

      <div className={s.summaryGrid}>
        <div className={s.summaryCard}>
          <div className={s.summaryValue}>{total}</div>
          <div className={s.summaryLabel}>Total</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryValue}>{pendientes}</div>
          <div className={s.summaryLabel}>Pendientes</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryValue}>{enRuta}</div>
          <div className={s.summaryLabel}>En camino</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryValue}>{entregados}</div>
          <div className={s.summaryLabel}>Entregados</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryValue}>{fallidos}</div>
          <div className={s.summaryLabel}>Fallidos</div>
        </div>
      </div>

      <div className={s.toolbar}>
        <select
          className={s.toolbarSelect}
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ASIGNADO">Pendientes</option>
          <option value="EN_RUTA">En camino</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="FALLIDO">Fallidos</option>
        </select>
      </div>

      {loading ? (
        <div className={s.emptyState}>Cargando ruta del día...</div>
      ) : items.length === 0 ? (
        <div className={s.emptyState}>No hay entregas para mostrar</div>
      ) : (
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Domiciliario</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.order?.numero || item.orderId}</td>
                  <td>{item.order?.cliente || item.domiciliarioNombre || '-'}</td>
                  <td>{item.order?.direccion || item.direccion || '-'}</td>
                  <td>{item.order?.telefono || item.telefono || '-'}</td>
                  <td>
                    {item.domiciliarioNombre ? (
                      <div className={s.domiciliarioCell}>
                        <User size={14} />
                        <span>{item.domiciliarioNombre}</span>
                        {item.domiciliarioTelefono && (
                          <a href={`tel:${item.domiciliarioTelefono}`} className={s.domiciliarioLink}>
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Sin asignar</span>
                    )}
                  </td>
                  <td>
                    <select
                      className={s.toolbarSelect}
                      value={item.estado}
                      onChange={(e) => changeStatus(item.id, e.target.value as DeliveryRutaItem['estado'])}
                      disabled={statusUpdatingId === item.id}
                    >
                      <option value="ASIGNADO">Pendiente</option>
                      <option value="EN_RUTA">En camino</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="FALLIDO">Fallido</option>
                    </select>
                  </td>
                  <td>{item.asignadoEn ? new Date(item.asignadoEn).toLocaleString('es-CO') : '-'}</td>
                  <td>
                    <select
                      className={s.toolbarSelect}
                      value={item.domiciliarioId || ''}
                      onChange={(e) => assignDriver(item.id, e.target.value || undefined)}
                      disabled={assigningId === item.id || loadingDomiciliarios}
                    >
                      <option value="">Sin asignar</option>
                      {domiciliarios.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
