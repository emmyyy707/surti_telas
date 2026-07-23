import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, MessageCircle, Archive, Package, CreditCard, User } from 'lucide-react';
import s from './MisPedidos.module.css';
import { Badge } from '@/shared/ui/Badge';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { DetailModal } from '@/shared/ui/DetailModal';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import type { Pedido } from '@/core/types';

const statusVariant = (estado: Pedido['estado']) => {
  if (estado === 'Entregado') return 'success';
  if (estado === 'En producción' || estado === 'Despachado' || estado === 'En camino') return 'info';
  if (estado === 'Listo') return 'warning';
  if (estado === 'Cancelado') return 'danger';
  return 'default';
};

export const MisPedidos: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [chatPedido, setChatPedido] = useState<Pedido | null>(null);
  const [mensajeAsesor, setMensajeAsesor] = useState('');
  const [cancelPedido, setCancelPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ordersApi.me();
        setPedidos(result.pedidos);
      } catch {
        setError('No se pudieron cargar tus pedidos');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) =>
      activeFilter === 'todos' || p.estado.toLowerCase().replace(' ', '') === activeFilter
    );
  }, [pedidos, activeFilter]);

  const filtrosEstado = [
    { label: 'Todos', key: 'todos', count: pedidos.length },
    { label: 'Nuevo', key: 'nuevo', count: pedidos.filter((p) => p.estado === 'Nuevo').length },
    { label: 'En producción', key: 'produccion', count: pedidos.filter((p) => p.estado === 'En producción').length },
    { label: 'Listo', key: 'listo', count: pedidos.filter((p) => p.estado === 'Listo').length },
    { label: 'Despachado', key: 'despachado', count: pedidos.filter((p) => p.estado === 'Despachado').length },
    { label: 'En camino', key: 'camino', count: pedidos.filter((p) => p.estado === 'En camino').length },
    { label: 'Entregado', key: 'entregado', count: pedidos.filter((p) => p.estado === 'Entregado').length },
    { label: 'Cancelado', key: 'cancelado', count: pedidos.filter((p) => p.estado === 'Cancelado').length },
  ];

  const contactarAsesor = () => {
    if (!chatPedido) return;
    if (!mensajeAsesor.trim()) {
      toast.error('Escribe un mensaje para tu asesor');
      return;
    }
    const texto = `Hola, tengo una consulta sobre el pedido ${chatPedido.id}: ${mensajeAsesor}`;
    navigator.clipboard?.writeText(texto).catch(() => undefined);
    toast.success('Mensaje copiado para enviar por WhatsApp');
    setMensajeAsesor('');
    setChatPedido(null);
  };

  const cancelarPedido = async () => {
    if (!cancelPedido) return;
    try {
      await ordersApi.updateStatus(cancelPedido.id, 'Cancelado');
      setPedidos((prev) => prev.map((p) => (p.id === cancelPedido.id ? { ...p, estado: 'Cancelado' } : p)));
      toast.success(`Pedido ${cancelPedido.id} cancelado`);
    } catch {
      toast.error('No se pudo cancelar el pedido');
    } finally {
      setCancelPedido(null);
    }
  };

  if (loading) {
    return (
      <div className={s.pedidosLayout}>
        <h1 className={s.pageTitle}>Mis Pedidos</h1>
        <p className={s.pageSubtitle}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.pedidosLayout}>
        <h1 className={s.pageTitle}>Mis Pedidos</h1>
        <p className={s.pageSubtitle}>{error}</p>
      </div>
    );
  }

  return (
    <div className={s.pedidosLayout}>
      <h1 className={s.pageTitle}>Mis Pedidos</h1>
      <p className={s.pageSubtitle}>Historial y seguimiento de tus compras</p>

      <div className={s.estadoTabs}>
        {filtrosEstado.map((filtro) => (
          <button
            key={filtro.key}
            className={`${s.estadoTab} ${activeFilter === filtro.key ? s.estadoTabActive : ''}`}
            onClick={() => setActiveFilter(filtro.key)}
          >
            {filtro.label}
            <span className={s.estadoBubble}>{filtro.count}</span>
          </button>
        ))}
      </div>

      <div>
        {filteredPedidos.length === 0 ? (
          <div style={{ padding: '40px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            No hay pedidos registrados
          </div>
        ) : (
          filteredPedidos.map((pedido) => (
            <div key={pedido.id} className={`${s.pedidoCard} ${expandedPedido === pedido.id ? s.pedidoCardExpanded : ''}`}>
              <div
                className={s.pedidoCardHeader}
                onClick={() => setExpandedPedido(expandedPedido === pedido.id ? null : pedido.id)}
              >
                <div className={s.pedidoId}>{pedido.id}</div>

                <div className={s.pedidoMeta}>
                  <div className={s.pedidoMetaItem}>
                    <span className={s.pedidoMetaLabel}>Fecha</span>
                    <span className={s.pedidoMetaValue}>{pedido.fecha}</span>
                  </div>
                  <div className={s.pedidoMetaItem}>
                    <span className={s.pedidoMetaLabel}>Items</span>
                    <span className={s.pedidoMetaValue}>{pedido.items}</span>
                  </div>
                  <div className={s.pedidoMetaItem}>
                    <span className={s.pedidoMetaLabel}>Total</span>
                    <span className={`${s.pedidoMetaValue} ${s.pedidoMetaValueStrong}`}>{pedido.total}</span>
                  </div>
                </div>

                <Badge variant={statusVariant(pedido.estado)}>
                  {pedido.estado}
                </Badge>

                <ChevronDown
                  size={18}
                  className={`${s.pedidoChevron} ${expandedPedido === pedido.id ? s.pedidoChevronOpen : ''}`}
                />
              </div>

              {expandedPedido === pedido.id && (
                <div className={s.pedidoExpanded}>
                  <div className={s.pedidoExpandedInner}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                        Detalle de artículos
                      </h3>
                      <table className={s.itemsTable}>
                        <thead>
                          <tr>
                            <th>Referencia</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(pedido.itemsList || []).map((item, idx) => (
                            <tr key={idx}>
                              <td className={s.itemRef}>—</td>
                              <td>
                                <div className={s.itemNombre}>{item.nombre}</div>
                              </td>
                              <td>{item.cantidad}</td>
                              <td>${String(item.precio).toLocaleString()}</td>
                              <td>${(item.cantidad * item.precio).toLocaleString()}</td>
                            </tr>
                          ))}
                          {(pedido.itemsList || []).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-sm text-[var(--color-text-muted)]">Sin detalle de artículos registrado.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <div className={s.pedidoResumen}>
                        <div className={s.resumenRow}>
                          <span>Total</span>
                          <span className={s.resumenValor}>{pedido.total}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={s.whatsappBtn}
                          onClick={() => setChatPedido(pedido)}
                        >
                          <MessageCircle size={14} />
                          Consultar por WhatsApp
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center rounded-xl border border-[var(--color-border)] bg-transparent px-3 text-sm font-medium text-[var(--color-text-primary)]"
                          onClick={() => setSelectedPedido(pedido)}
                        >
                          <Archive size={14} style={{ marginRight: 6 }} />
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] px-3 text-sm font-medium text-[var(--btn-primary-text)]"
                          onClick={() => navigate(`/cliente/seguimiento/${encodeURIComponent(pedido.id)}`)}
                        >
                          <Package size={14} style={{ marginRight: 6 }} />
                          Seguimiento
                        </button>
                        {pedido.estado === 'Nuevo' && (
                          <button
                            type="button"
                            className="inline-flex h-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-sm font-medium text-red-400"
                            onClick={() => setCancelPedido(pedido)}
                          >
                            Cancelar pedido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <DetailModal
        children={null}
        open={Boolean(selectedPedido)}
        onClose={() => setSelectedPedido(null)}
        title={selectedPedido ? `Pedido ${selectedPedido.id}` : 'Pedido'}
        subtitle={selectedPedido?.fecha}
        size="xl"
        header={{
          icon: <Archive size={18} />,
          status: selectedPedido ? <Badge variant={statusVariant(selectedPedido.estado)}>{selectedPedido.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Información del pedido',
            fields: [
              { label: 'Cliente', value: selectedPedido?.cliente, icon: <User size={16} /> },
              { label: 'Total', value: selectedPedido?.total, icon: <CreditCard size={16} /> },
              { label: 'Artículos', value: selectedPedido?.items, icon: <Package size={16} /> },
              { label: 'Observaciones', value: selectedPedido?.observaciones || 'Sin observaciones', fullWidth: true, icon: <MessageCircle size={16} /> },
            ],
          },
          {
            title: 'Detalle de artículos',
            children: (
              <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--color-bg-elevated)] text-left text-[var(--color-text-secondary)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                      <th className="px-4 py-3 font-medium text-right">Precio</th>
                      <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPedido?.itemsList || []).map((item, index) => (
                      <tr key={`${item.nombre}-${index}`} className="border-t border-[var(--color-border)]">
                        <td className="px-4 py-3 text-[var(--color-text-primary)]">{item.nombre}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">${item.precio.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[var(--color-text-primary)]">${(item.cantidad * item.precio).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          },
        ]}
      />

      <Modal open={Boolean(chatPedido)} onClose={() => setChatPedido(null)} title={`Consultar pedido ${chatPedido?.id}`} size="sm">
        <div className="grid gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Escribe la consulta y copia el mensaje para enviarlo por tu canal de WhatsApp.</p>
          <textarea className="min-h-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" placeholder="Ej: ¿Cuándo sale despachado mi pedido?" value={mensajeAsesor} onChange={(e) => setMensajeAsesor(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setChatPedido(null)}>Cancelar</Button>
            <Button onClick={contactarAsesor}><MessageCircle size={14} /> Copiar mensaje</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        open={Boolean(cancelPedido)}
        onClose={() => setCancelPedido(null)}
        onConfirm={cancelarPedido}
        title="Cancelar pedido"
        description={`¿Estás seguro de cancelar el pedido ${cancelPedido?.id}? Esta acción cambiará el estado a Cancelado.`}
        variant="danger"
        confirmLabel="Cancelar pedido"
      />
    </div>
  );
};
