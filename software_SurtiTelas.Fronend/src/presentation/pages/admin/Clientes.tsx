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
import { authApi, type BackendAuthUser, type BackendRole } from '@/infrastructure/api/authApi';
import { customersApi } from '@/infrastructure/api/customersApi';

interface ClienteUI extends BackendAuthUser {
  telefono?: string | null;
  nit?: string | null;
  isTrustedCustomer?: boolean;
  estadoCliente?: 'Activo' | 'Inactivo';
}

export const AdminClientes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteUI | null>(null);
  const [items, setItems] = useState<ClienteUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ClienteUI | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.listUsers({ limit: 100 });
      const soloClientes = result.data.filter((u) => u.role === 'CLIENTE');
      const clientesConDatos = await Promise.all(
        soloClientes.map(async (u) => {
          try {
            const customer = await customersApi.list({ limit: 1 });
            const match = customer.data.find((c) => c.nombre === u.nombre || c.email === u.email);
            return {
              ...u,
              telefono: match?.tel ?? null,
              nit: match?.nit ?? null,
              isTrustedCustomer: match?.isTrustedCustomer ?? false,
              estadoCliente: match?.estado ?? 'Activo',
            } as ClienteUI;
          } catch {
            return { ...u, telefono: null, nit: null, isTrustedCustomer: false, estadoCliente: 'Activo' } as ClienteUI;
          }
        })
      );
      setItems(clientesConDatos);
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

  const filteredClientes = items.filter((c) =>
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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await authApi.deleteUser(deleteConfirm.id);
      setItems((prev) => prev.filter((it) => it.id !== deleteConfirm.id));
      toast.success('Cliente eliminado');
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el cliente');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nombre = String(formData.get('nombre') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const telefono = String(formData.get('telefono') ?? '').trim() || undefined;
    const nit = String(formData.get('nit') ?? '').trim() || undefined;
    const isTrustedCustomer = (formData.get('isTrustedCustomer') as string) === 'on';
    const estado = (formData.get('estado') as string) === 'Inactivo' ? 'Inactivo' : 'Activo';

    if (!nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      if (selectedCliente) {
        const customer = await customersApi.list({ limit: 1 });
        const match = customer.data.find((c) => c.nombre === selectedCliente.nombre || c.email === selectedCliente.email);

        if (match) {
          const updated = await customersApi.update(match.id, {
            nombre,
            tel: telefono,
            nit,
            isTrustedCustomer,
            estado,
          });
          setItems((prev) =>
            prev.map((it) =>
              it.id === updated.id ? { ...it, nombre: updated.nombre, telefono: updated.tel, nit: updated.nit, isTrustedCustomer: updated.isTrustedCustomer, estadoCliente: updated.estado } : it
            )
          );
          toast.success('Cliente actualizado');
        } else {
          const created = await customersApi.create({
            nombre,
            tel: telefono,
            nit,
            isTrustedCustomer,
            estado,
          });
          setItems((prev) => [{ ...selectedCliente, telefono, nit, isTrustedCustomer, estadoCliente: estado }, ...prev]);
          toast.success('Datos de cliente creados');
        }
      } else {
        const created = await customersApi.create({
          nombre,
          tel: telefono,
          nit,
          isTrustedCustomer,
          estado,
        });
        setItems((prev) => [...prev, { id: created.id, nombre: created.nombre, email: created.email ?? '', role: 'CLIENTE' as BackendRole, telefono: created.tel, nit: created.nit, isTrustedCustomer: created.isTrustedCustomer, estadoCliente: created.estado }]);
        toast.success('Cliente creado');
      }
      closeModal();
    } catch {
      toast.error('No se pudo guardar el cliente');
    }
  };

  const columns: DataTableColumn<ClienteUI>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true, render: (c) => c.email ?? '—' },
    { key: 'telefono', header: 'Teléfono', render: (c) => c.telefono ?? '—' },
    { key: 'nit', header: 'Documento', render: (c) => c.nit ?? '—' },
    {
      key: 'isTrustedCustomer',
      header: 'Cliente de confianza',
      render: (c) => (
        <Badge variant={c.isTrustedCustomer ? 'success' : 'outline'}>
          {c.isTrustedCustomer ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'estadoCliente',
      header: 'Estado',
      sortable: true,
      render: (c) => (
        <Badge variant={c.estadoCliente === 'Activo' ? 'success' : 'default'}>{c.estadoCliente ?? 'Activo'}</Badge>
      ),
    },
  ];

  const detailPanel: DataTableDetailPanel<ClienteUI> = {
    title: (item) => `Cliente: ${item.nombre}`,
    size: 'lg',
    header: (item) => ({
      icon: <User size={18} aria-hidden="true" focusable="false" />,
      title: 'Cliente',
      code: item.id,
      subtitle: item.email ?? '',
      status: item.estadoCliente ?? 'Activo',
      badgeVariant: item.estadoCliente === 'Inactivo' ? 'default' : 'success',
    }),
    render: (item) => (
      <div className={s.detailModalContent}>
        <div className={s.detailSection}>
          <h4 className={s.detailSectionTitle}>Información básica</h4>
          <div className={s.detailGrid}>
            <div className={s.detailItem}><span className={s.detailLabel}>ID</span><span>{item.id}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Nombre</span><span>{item.nombre}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Email</span><span>{item.email || '—'}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Teléfono</span><span>{item.telefono || '—'}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>NIT</span><span>{item.nit || '—'}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Rol</span><span>{item.role}</span></div>
            <div className={s.detailItem}><span className={s.detailLabel}>Cliente de confianza</span><span>{item.isTrustedCustomer ? 'Sí' : 'No'}</span></div>
          </div>
        </div>
        <div className={s.modalActions}>
          <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
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
          <p className={s.pageSubtitle}>Gestión de usuarios con rol Cliente</p>
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
        <form className={s.form} ref={formRef} onSubmit={handleSubmit}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Nombre</label>
              <input type="text" className={s.input} name="nombre" defaultValue={selectedCliente?.nombre} required maxLength={100} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input type="email" className={s.input} name="email" defaultValue={selectedCliente?.email ?? ''} required maxLength={100} />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Teléfono</label>
              <input type="tel" className={s.input} name="telefono" defaultValue={selectedCliente?.telefono ?? ''} maxLength={10} pattern="[0-9]*" inputMode="numeric" />
            </div>
            <div className={s.field}>
              <label className={s.label}>NIT / Documento</label>
              <input type="text" className={s.input} name="nit" defaultValue={selectedCliente?.nit ?? ''} maxLength={10} inputMode="numeric" />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Estado</label>
              <select className={s.input} name="estado" defaultValue={selectedCliente?.estadoCliente ?? 'Activo'}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
              <input type="checkbox" id="isTrustedCustomer" name="isTrustedCustomer" defaultChecked={selectedCliente?.isTrustedCustomer ?? false} />
              <label htmlFor="isTrustedCustomer" className={s.label} style={{ margin: 0 }}>Cliente de confianza</label>
            </div>
          </div>
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{selectedCliente ? 'Guardar cambios' : 'Crear cliente'}</Button>
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
