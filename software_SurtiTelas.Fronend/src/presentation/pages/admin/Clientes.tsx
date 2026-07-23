import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '../../../shared/ui/DataTable';
import { Modal } from '../../../shared/ui/Modal';
import { ConfirmationModal } from '../../../shared/ui/ConfirmationModal';
import s from './Clientes.module.css';
import { authApi, type BackendAuthUser } from '@/infrastructure/api/authApi';

interface ClienteUI {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: 'Activo' | 'Inactivo';
}

const toCliente = (u: BackendAuthUser): ClienteUI => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  telefono: (u as { telefono?: string | null }).telefono ?? null,
  estado: 'Activo',
});

export const AdminClientes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteUI | null>(null);
  const [items, setItems] = useState<ClienteUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ClienteUI | null>(null);
  const [saving, setSaving] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.listUsers();
      const clientes = data.data
        .filter(u => u.role === 'CLIENTE')
        .map(toCliente);
      setItems(clientes);
    } catch {
      setError('No se pudieron cargar los clientes');
      toast.error('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClientes();
  }, []);

  const filteredClientes = items.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setSelectedCliente(null);
    setModalOpen(true);
  };

  const openEdit = (cliente: ClienteUI) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCliente(null);
  };

  const handleSubmit = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const telefonoRaw = String(fd.get('telefono') ?? '').trim();
    const telefono = telefonoRaw ? telefonoRaw : undefined;
    const password = String(fd.get('password') ?? '').trim();
    setSaving(true);
    try {
      if (selectedCliente) {
        await authApi.updateUser(selectedCliente.id, { nombre, telefono });
        setItems(prev => prev.map(it => it.id === selectedCliente.id ? { ...it, nombre, email, telefono: telefono ?? null } : it));
        toast.success('Cliente actualizado');
      } else {
        if (!password) {
          toast.error('La contraseña es obligatoria');
          return;
        }
        const nuevo = await authApi.createUser({
          email,
          password,
          nombre,
          role: 'CLIENTE',
          telefono,
        });
        setItems(prev => [{ id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, telefono: telefono ?? null, estado: 'Activo' }, ...prev]);
        toast.success('Cliente creado');
      }
      closeModal();
    } catch {
      toast.error(selectedCliente ? 'No se pudo actualizar el cliente' : 'No se pudo crear el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await authApi.deleteUser(deleteConfirm.id);
      setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
      toast.success('Cliente eliminado');
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el cliente');
    }
  };

  const columns: DataTableColumn<ClienteUI>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'telefono', header: 'Teléfono', render: (c) => c.telefono || '—' },
    { key: 'estado', header: 'Estado', sortable: true, render: (c) => (
      <Badge variant={c.estado === 'Activo' ? 'success' : 'default'}>{c.estado}</Badge>
    )},
  ];

  const detailPanel: DataTableDetailPanel<ClienteUI> = {
    title: item => `Cliente: ${item.nombre}`,
    size: 'lg',
    header: item => ({
      icon: <User size={18} aria-hidden="true" focusable="false" />,
      title: 'Cliente',
      code: item.id,
      subtitle: item.email,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : 'default',
    }),
    render: (item, onClose) => (
      <div className={s.detailModalContent}>
        <div className={s.detailSection}>
          <h4 className={s.detailSectionTitle}>Información básica</h4>
          <div className={s.detailGrid}>
            <div className={s.detailItem}><span className={s.detailLabel}>ID</span><span>{item.id}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Nombre</span><span>{item.nombre}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Email</span><span>{item.email || '—'}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Teléfono</span><span>{item.telefono || '—'}</span></div>
          </div>
        </div>
        <div className={s.modalActions}>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    ),
  };

  const actions: DataTableAction<ClienteUI>[] = [
    { label: 'Editar', icon: <Edit size={14} aria-hidden="true" focusable="false" />, onClick: openEdit },
    { label: 'Eliminar', icon: <Trash2 size={14} aria-hidden="true" focusable="false" />, onClick: (item) => setDeleteConfirm(item), danger: true },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Clientes</h1>
          <p className={s.pageSubtitle}>Gestión de clientes de la empresa</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Nuevo Cliente
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <DataTable<ClienteUI>
        data={filteredClientes}
        columns={columns}
        detailPanel={detailPanel}
        actions={actions}
        enableSorting
        enableColumnFilters
        enableRowSelection={false}
        enableExport={false}
        emptyMessage={loading ? 'Cargando clientes...' : error ? error : 'Sin resultados'}
        serverMode={false}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <form className={s.form} ref={formRef}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Nombre</label>
              <input type="text" className={s.input} name="nombre" defaultValue={selectedCliente?.nombre} required />
            </div>
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input type="email" className={s.input} name="email" defaultValue={selectedCliente?.email} required />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Teléfono</label>
              <input type="tel" className={s.input} name="telefono" defaultValue={selectedCliente?.telefono ?? ''} />
            </div>
            <div className={s.field}>
              <label className={s.label}>{selectedCliente ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
              <input type="password" className={s.input} name="password" placeholder={selectedCliente ? 'Dejar vacío para mantener la actual' : 'Contraseña del cliente'} required={!selectedCliente} />
            </div>
          </div>
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{selectedCliente ? (saving ? 'Guardando...' : 'Guardar cambios') : (saving ? 'Creando...' : 'Crear cliente')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar cliente"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
