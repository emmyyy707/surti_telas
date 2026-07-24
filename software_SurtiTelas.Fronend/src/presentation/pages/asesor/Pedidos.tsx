import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, Plus, Archive, CreditCard, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import s from '../admin/Pedidos.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DetailModal } from '@/shared/ui/DetailModal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { Tooltip } from '@/shared/components/Tooltip';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { authApi } from '@/infrastructure/api/authApi';
import { useAuthStore } from '@/core/stores/authStore';
import { useClientes } from '@/core/stores';
import type { Pedido } from '@/core/types';
import type { BackendAuthUser } from '@/infrastructure/api/authApi';

const orderStatuses: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default' | null> = {
  'Nuevo': 'default',
  'En producción': 'info',
  'Listo': 'warning',
  'Despachado': 'default',
  'En camino': 'info',
  'Entregado': 'success',
  'Cancelado': 'danger',
};

const emptyPedidoForm: Omit<Pedido, 'id'> = {
  cliente: '',
  asesor: '',
  fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
  items: 1,
  total: '0',
  estado: 'Nuevo',
  prioridad: 'Estándar',
  observaciones: '',
  itemsList: [],
};

import { parseCurrency } from '@/shared/utils/number';

export const AsesorPedidos: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { clientes } = useClientes();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [asesores, setAsesores] = useState<BackendAuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<Omit<Pedido, 'id'>>(emptyPedidoForm);
  const [statusValue, setStatusValue] = useState<Pedido['estado']>('Nuevo');
  const asesorInicialRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersResult, usersResult] = await Promise.all([
          ordersApi.list({ asesorId: user?.uid }),
          authApi.listUsers(),
        ]);
        setPedidos(ordersResult.pedidos);
        setAsesores(usersResult.data.filter((u) => u.role === 'ASESOR'));
        if (!asesorInicialRef.current && usersResult.data.some((u) => u.role === 'ASESOR')) {
          const asesor = usersResult.data.find((u) => u.role === 'ASESOR');
          setForm((prev) => ({ ...prev, asesor: asesor?.nombre ?? '' }));
          asesorInicialRef.current = true;
        }
      } catch {
        toast.error('No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.uid]);

  const misPedidos = pedidos;

  const filteredPedidos = useMemo(() => {
    return misPedidos.filter((p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.toLowerCase().includes(search.toLowerCase())
    );
  }, [misPedidos, search]);

  const resetForm = () => {
    setForm({ ...emptyPedidoForm, asesor: user?.name || '' });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (pedido: Pedido) => {
    setEditingId(pedido.id);
    setForm({
      cliente: pedido.cliente,
      asesor: pedido.asesor,
      fecha: pedido.fecha,
      items: pedido.items,
      total: pedido.total,
      estado: pedido.estado,
      prioridad: pedido.prioridad || 'Estándar',
      observaciones: pedido.observaciones || '',
      itemsList: pedido.itemsList || [],
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDetailOpen(true);
  };

  const openStatus = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setStatusValue(pedido.estado);
    setIsStatusOpen(true);
  };

  const openDelete = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDeleteOpen(true);
  };

  const savePedido = async () => {
    setFormError('');
    const items = Number(form.items) || 0;
    const total = parseCurrency(form.total);

    if (!form.cliente.trim()) {
      setFormError('El cliente es obligatorio.');
      return;
    }
    if (items <= 0) {
      setFormError('La cantidad de artículos debe ser mayor a 0.');
      return;
    }
    if (total <= 0) {
      setFormError('El total del pedido debe ser mayor a 0.');
      return;
    }

    try {
      if (editingId) {
        const cliente = clientes.find((c) => c.nombre.toLowerCase() === form.cliente.toLowerCase());
        const actualizado = await ordersApi.updateOrderFull(editingId, {
          clienteId: cliente?.id || form.cliente,
          asesorId: user?.uid,
          prioridad: form.prioridad,
          observaciones: form.observaciones,
        });
        setPedidos((prev) => prev.map((p) => (p.id === editingId ? { ...actualizado, cliente: form.cliente, asesor: form.asesor, items, total: form.total, fecha: form.fecha } : p)));
        toast.success(`Pedido ${actualizado.id} actualizado`);
      } else {
        const cliente = clientes.find((c) => c.nombre.toLowerCase() === form.cliente.toLowerCase());
        if (!cliente) {
          setFormError('Cliente no encontrado. Registra el cliente primero.');
          return;
        }
        const data: Omit<Pedido, 'id'> = {
          ...form,
          items,
          total: `$${total.toLocaleString()}`,
          itemsList: form.itemsList && form.itemsList.length > 0
            ? form.itemsList
            : [{ nombre: 'Solicitud personalizada', precio: Math.round(total / items), cantidad: items }],
        };
        const resultado = await ordersApi.create({
          clienteId: cliente.id,
          asesorId: user?.uid,
          itemsList: data.itemsList || [],
          prioridad: data.prioridad,
          observaciones: data.observaciones,
        });
        setPedidos((prev) => [resultado.pedido, ...prev]);
        toast.success(`Pedido ${resultado.pedido.id} creado correctamente`);
      }
      setIsFormOpen(false);
      resetForm();
    } catch {
      toast.error('No fue posible guardar el pedido.');
    }
  };

  const saveStatus = async () => {
    if (!selectedPedido) return;
    const actualizado = await ordersApi.updateStatus(selectedPedido.id, statusValue);
    setPedidos((prev) => prev.map((p) => (p.id === selectedPedido.id ? actualizado : p)));
    toast.success(`Pedido ${actualizado.id} marcado como ${statusValue}`);
    setIsStatusOpen(false);
    setSelectedPedido(null);
  };

  const confirmDelete = async () => {
    if (!selectedPedido) return;
    try {
      await ordersApi.delete(selectedPedido.id);
      setPedidos((prev) => prev.filter((p) => p.id !== selectedPedido.id));
      toast.success(`Pedido ${selectedPedido.id} eliminado`);
    } catch {
      toast.error('No se pudo eliminar el pedido');
    } finally {
      setIsDeleteOpen(false);
      setSelectedPedido(null);
    }
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Pedidos</h1>
          <p className={s.pageSubtitle}>Gestión de tus pedidos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Nuevo Pedido
        </Button>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  {loading ? 'Cargando pedidos...' : 'No hay pedidos'}
                </td>
              </tr>
            ) : (
              filteredPedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className={s.tdMono}>{pedido.id}</td>
                  <td className={s.tdPrimary}>{pedido.cliente}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.items}</td>
                  <td>{pedido.total}</td>
                  <td>
                    <Badge variant={orderStatuses[pedido.estado]}>
                      {pedido.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <Tooltip title="Ver detalle"><button className={s.actionBtn} onClick={() => openDetail(pedido)}>Ver</button></Tooltip>
                      <Tooltip title="Editar"><button className={s.actionBtn} onClick={() => openEdit(pedido)}>Editar</button></Tooltip>
                      <Tooltip title="Cambiar estado"><button className={s.actionBtn} onClick={() => openStatus(pedido)}>Estado</button></Tooltip>
                      <Tooltip title="Eliminar"><button className={s.actionBtn} onClick={() => openDelete(pedido)}>Eliminar</button></Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DetailModal
        children={null}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPedido ? `Pedido ${selectedPedido.id}` : 'Pedido'}
        subtitle={selectedPedido?.fecha}
        size="xl"
        header={{
          icon: <Archive size={18} />,
          status: selectedPedido ? <Badge variant={orderStatuses[selectedPedido.estado]}>{selectedPedido.estado}</Badge> : undefined,
        }}
        kpis={selectedPedido ? [
          { label: 'Cliente', value: selectedPedido.cliente, icon: <Archive size={16} /> },
          { label: 'Total', value: selectedPedido.total, icon: <CreditCard size={16} />, monospace: true },
          { label: 'Prioridad', value: selectedPedido.prioridad || 'Estándar', icon: <AlertTriangle size={16} /> },
        ] : undefined}
        sections={[
          {
            title: 'Detalle comercial',
            fields: [
              { label: 'Asesor asignado', value: selectedPedido?.asesor, icon: <Archive size={16} /> },
              { label: 'Cantidad de artículos', value: selectedPedido?.items, icon: <Package size={16} /> },
              { label: 'Observaciones', value: selectedPedido?.observaciones || 'Sin observaciones', fullWidth: true, icon: <AlertTriangle size={16} /> },
            ],
          },
          {
            title: 'Artículos',
            children: (
              <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--color-bg-elevated)] text-left text-[var(--color-text-secondary)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Referencia</th>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                      <th className="px-4 py-3 font-medium text-right">Precio</th>
                      <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPedido?.itemsList || []).map((item, index) => (
                      <tr key={`${item.nombre}-${index}`} className="border-t border-[var(--color-border)]">
                        <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">REF-{String(index + 1).padStart(3, '0')}</td>
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
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
            {selectedPedido && <Button onClick={() => { setIsDetailOpen(false); openStatus(selectedPedido); }}>Cambiar estado</Button>}
          </div>
        }
      />

      <DetailModal
        children={null}
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={editingId ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
        subtitle={editingId ? 'Actualiza los datos del pedido' : 'Registra un pedido para tus clientes'}
        size="lg"
        sections={[
          {
            title: 'Datos del pedido',
            children: (
              <div className="grid gap-4">
                {formError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Cliente
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Nombre del cliente" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Fecha
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Asesor
                    <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.asesor} onChange={(e) => setForm({ ...form, asesor: e.target.value })}>
                      <option value="">Selecciona un asesor</option>
                      {asesores.map((u) => (
                        <option key={u.id} value={u.nombre}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Estado
                    <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Pedido['estado'] })}>
                      {(['Nuevo', 'En producción', 'Listo', 'Despachado', 'En camino', 'Entregado', 'Cancelado'] as Pedido['estado'][]).map((es) => (
                        <option key={es} value={es}>{es}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Cantidad de artículos
                    <input type="number" min="1" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.items} onChange={(e) => setForm({ ...form, items: Number(e.target.value) })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Total
                    <input type="number" min="1" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={parseCurrency(form.total)} onChange={(e) => setForm({ ...form, total: `$${Number(e.target.value || 0).toLocaleString()}` })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Prioridad
                    <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value as Pedido['prioridad'] })}>
                      <option value="Estándar">Estándar</option>
                      <option value="Prioritario">Prioritario</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  Observaciones
                  <textarea className="min-h-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
                </label>
              </div>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancelar</Button>
            <Button type="button" onClick={savePedido}>{editingId ? 'Guardar cambios' : 'Crear pedido'}</Button>
          </div>
        }
      />

      <DetailModal
        children={null}
        open={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        title="Cambiar estado del pedido"
        subtitle={selectedPedido ? `Pedido ${selectedPedido.id}` : undefined}
        sections={[
          {
            title: 'Nuevo estado',
            children: (
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Estado
                <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={statusValue} onChange={(e) => setStatusValue(e.target.value as Pedido['estado'])}>
                  {Object.keys(orderStatuses).map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsStatusOpen(false)}>Cancelar</Button>
            <Button onClick={saveStatus}>Aplicar cambio</Button>
          </div>
        }
      />

      <ConfirmationModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar pedido"
        description={`¿Estás seguro de eliminar el pedido ${selectedPedido?.id}? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar pedido"
      />
    </div>
  );
};
