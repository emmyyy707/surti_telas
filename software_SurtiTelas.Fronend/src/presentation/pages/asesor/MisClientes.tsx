import React, { useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, User, MapPin, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import s from '../admin/Clientes.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DetailModal } from '@/shared/ui/DetailModal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { Tooltip } from '@/shared/components/Tooltip';
import { useClientes, usePedidos } from '@/core/stores';
import { useAuthStore } from '@/core/stores/authStore';
import type { Cliente } from '@/core/types';

const emptyClienteForm: Omit<Cliente, 'id' | 'pedidos'> = {
  nombre: '',
  ciudad: '',
  tel: '',
  asesor: '',
  estado: 'Activo',
  nit: '',
  cupoTotal: 0,
  cupoUsado: 0,
  deudaVencida: 0,
  isTrustedCustomer: false,
};

export const AsesorClientes: React.FC = () => {
  const user = useAuthStore((st) => st.user);
  const asesorActual = user?.name || '';
  const { clientes, createCliente, updateCliente, deleteCliente } = useClientes();
  const { pedidos } = usePedidos();
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<Omit<Cliente, 'id' | 'pedidos'>>(emptyClienteForm);

  const misClientes = useMemo(() => clientes.filter(c => c.asesor === asesorActual), [clientes, asesorActual]);

  const filteredClientes = useMemo(() => {
    return misClientes.filter(c =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      c.tel.includes(search)
    );
  }, [misClientes, search]);

  const resetForm = () => {
    setForm({ ...emptyClienteForm, asesor: asesorActual });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      tel: cliente.tel,
      asesor: cliente.asesor,
      estado: cliente.estado,
      nit: cliente.nit || '',
      cupoTotal: cliente.cupoTotal || 0,
      cupoUsado: cliente.cupoUsado || 0,
      deudaVencida: cliente.deudaVencida || 0,
      isTrustedCustomer: cliente.isTrustedCustomer || false,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDetailOpen(true);
  };

  const openDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteOpen(true);
  };

  const saveCliente = async () => {
    setFormError('');
    if (!form.nombre.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      return;
    }
    if (!form.ciudad.trim() || !form.tel.trim()) {
      setFormError('La ciudad y el teléfono son obligatorios.');
      return;
    }

    try {
      if (editingId) {
        const actualizado = await updateCliente(editingId, form);
        toast.success(`${actualizado.nombre} actualizado correctamente`);
      } else {
        const nuevo = await createCliente(form);
        toast.success(`${nuevo.nombre} registrado correctamente`);
      }
      setIsFormOpen(false);
      resetForm();
    } catch {
      toast.error('No fue posible guardar el cliente.');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCliente) return;
    await deleteCliente(selectedCliente.id);
    toast.success(`Cliente ${selectedCliente.nombre} eliminado`);
    setIsDeleteOpen(false);
    setSelectedCliente(null);
  };

  const pedidosCliente = selectedCliente
    ? pedidos.filter(p => p.cliente === selectedCliente.nombre).slice(0, 5)
    : [];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Mis Clientes</h1>
          <p className={s.pageSubtitle}>Clientes asignados a tu cartera</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nuevo Cliente
        </Button>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Teléfono</th>
              <th>Pedidos</th>
              <th>Estado</th>
              <th>Confianza</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              filteredClientes.map(cliente => (
                <tr key={cliente.id}>
                  <td className={s.tdMono}>{cliente.id}</td>
                  <td className={s.tdPrimary}>{cliente.nombre}</td>
                  <td>{cliente.ciudad}</td>
                  <td>{cliente.tel}</td>
                  <td>{cliente.pedidos}</td>
                  <td>
                    <Badge variant={cliente.estado === 'Activo' ? 'success' : 'default'}>
                      {cliente.estado}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={cliente.isTrustedCustomer ? 'success' : 'outline'} dot={cliente.isTrustedCustomer}>
                      {cliente.isTrustedCustomer ? 'Cliente de Confianza' : 'Estándar'}
                    </Badge>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <Tooltip title="Ver"><button className={s.actionBtn} onClick={() => openDetail(cliente)}>
                        <Eye size={14} />
                      </button></Tooltip>
                      <Tooltip title="Editar"><button className={s.actionBtn} onClick={() => openEdit(cliente)}>
                        <Edit size={14} />
                      </button></Tooltip>
                      <Tooltip title="Eliminar"><button className={s.actionBtn} onClick={() => openDelete(cliente)}>
                        <Trash2 size={14} />
                      </button></Tooltip>
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
        title={selectedCliente ? `Cliente ${selectedCliente.id}` : 'Cliente'}
        subtitle={selectedCliente?.ciudad}
        size="xl"
        header={{
          icon: <User size={18} />,
          status: selectedCliente ? <Badge variant={selectedCliente.estado === 'Activo' ? 'success' : 'default'}>{selectedCliente.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Información comercial',
            fields: [
              { label: 'Nombre', value: selectedCliente?.nombre, icon: <User size={16} /> },
              { label: 'Ciudad', value: selectedCliente?.ciudad, icon: <MapPin size={16} /> },
              { label: 'Teléfono', value: selectedCliente?.tel, icon: <Phone size={16} /> },
              { label: 'NIT', value: selectedCliente?.nit || 'No registrado', icon: <CreditCard size={16} /> },
              { label: 'Asesor asignado', value: selectedCliente?.asesor, icon: <User size={16} /> },
            ],
          },
          {
            title: 'Cupo y cartera',
            fields: [
              { label: 'Cupo total', value: `$${(selectedCliente?.cupoTotal || 0).toLocaleString()}`, icon: <CreditCard size={16} /> },
              { label: 'Cupo usado', value: `$${(selectedCliente?.cupoUsado || 0).toLocaleString()}`, icon: <CreditCard size={16} /> },
              { label: 'Disponible', value: `$${Math.max((selectedCliente?.cupoTotal || 0) - (selectedCliente?.cupoUsado || 0), 0).toLocaleString()}`, icon: <CreditCard size={16} /> },
              { label: 'Deuda vencida', value: `$${(selectedCliente?.deudaVencida || 0).toLocaleString()}`, icon: <CreditCard size={16} />, tone: selectedCliente && selectedCliente.deudaVencida ? 'danger' : undefined },
            ],
          },
          {
            title: 'Pedidos recientes',
            children: pedidosCliente.length > 0 ? (
              <div className="grid gap-3">
                {pedidosCliente.map(pedido => (
                  <div key={pedido.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[var(--color-text-primary)]">{pedido.id}</div>
                        <div className="text-sm text-[var(--color-text-secondary)]">{pedido.fecha} • {pedido.items} artículos</div>
                      </div>
                      <Badge variant={pedido.estado === 'Entregado' ? 'success' : pedido.estado === 'Cancelado' ? 'danger' : 'info'}>{pedido.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                Este cliente aún no tiene pedidos registrados.
              </div>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
            {selectedCliente && (
              <Button onClick={() => { setIsDetailOpen(false); openEdit(selectedCliente); }}>
                <Edit size={14} />
                Editar cliente
              </Button>
            )}
          </div>
        }
      />

      <DetailModal
        children={null}
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
        subtitle={editingId ? 'Actualiza la información de la cuenta' : 'Crea un cliente para tu cartera'}
        size="lg"
        sections={[
          {
            title: 'Datos del cliente',
            children: (
              <div className="grid gap-4">
                {formError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Nombre comercial
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Ciudad
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Teléfono
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    NIT / CC
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Estado
                    <select className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as Cliente['estado'] })}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Asesor
                    <input className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.asesor} onChange={e => setForm({ ...form, asesor: e.target.value })} />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Cupo total
                    <input type="number" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.cupoTotal} onChange={e => setForm({ ...form, cupoTotal: Number(e.target.value) })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Cupo usado
                    <input type="number" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.cupoUsado} onChange={e => setForm({ ...form, cupoUsado: Number(e.target.value) })} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Deuda vencida
                    <input type="number" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]" value={form.deudaVencida} onChange={e => setForm({ ...form, deudaVencida: Number(e.target.value) })} />
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-sm font-medium text-[var(--color-text-primary)]">
                  <input type="checkbox" checked={form.isTrustedCustomer} onChange={e => setForm({ ...form, isTrustedCustomer: e.target.checked })} />
                  Marcar como cliente de confianza
                </label>
              </div>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancelar</Button>
            <Button type="button" onClick={saveCliente}>{editingId ? 'Guardar cambios' : 'Crear cliente'}</Button>
          </div>
        }
      />

      <ConfirmationModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a ${selectedCliente?.nombre}? Esta acción no elimina el historial de pedidos existentes.`}
        variant="danger"
        confirmLabel="Eliminar"
      />
    </div>
  );
};
