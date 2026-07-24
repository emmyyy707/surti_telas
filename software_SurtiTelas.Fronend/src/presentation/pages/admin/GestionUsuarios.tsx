import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, User, ShieldCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import s from './GestionUsuarios.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { usersApi, type Usuario } from '@/infrastructure/api/usersApi';
import { ROL_LABELS, ROLES_SISTEMA } from '@/shared/constants/options';

const roleToBackend: Record<string, 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE'> = {
  ADMIN: 'ADMIN',
  ASESO: 'ASESOR',
  ASESOR: 'ASESOR',
  DOMICILIARIO: 'DOMICILIARIO',
  CLIENTE: 'CLIENTE',
};

interface UsuarioConDatos extends Usuario {
  telefono?: string | null;
  nit?: string | null;
}

export const AdminGestionUsuarios: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConDatos | null>(null);
  const [items, setItems] = useState<UsuarioConDatos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UsuarioConDatos | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      setItems(data.filter((u) => u.rol === 'cliente'));
    } catch {
      setError('No se pudieron cargar los usuarios');
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsuarios();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return items.filter(u =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleSubmitUsuario = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const telefono = String(fd.get('telefono') ?? '').trim();
    const nit = String(fd.get('nit') ?? '').trim();
    if (!nombre || !email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    if (telefono && !/^[0-9]{1,10}$/.test(telefono)) {
      toast.error('Teléfono inválido. Máximo 10 dígitos numéricos.');
      return;
    }
    if (nit && !/^[0-9]{1,10}$/.test(nit)) {
      toast.error('Documento inválido. Máximo 10 dígitos numéricos.');
      return;
    }
    setSaving(true);
    try {
      if (selectedUsuario) {
        const actualizado = await usersApi.update(selectedUsuario.id, { nombre, telefono });
        setItems(prev => prev.map(it => it.id === selectedUsuario.id ? { ...actualizado, telefono } : it));
        toast.success('Usuario actualizado');
      } else {
        const randomPass = Math.random().toString(36).slice(-8);
        const creado = await usersApi.create({ nombre, email, telefono, role: 'CLIENTE', password: randomPass });
        setItems(prev => [creado, ...prev]);
        toast.success('Cliente creado');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<UsuarioConDatos>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'telefono', header: 'Teléfono', render: (c) => c.telefono ?? '—' },
    { key: 'nit', header: 'Documento', render: (c) => c.nit ?? '—' },
    { key: 'rol', header: 'Rol', sortable: true },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<UsuarioConDatos> = {
    title: item => `Detalle: ${item.nombre}`,
    size: 'lg',
    header: item => ({
      icon: <User size={18} />,
      title: 'Usuario del sistema',
      code: item.id,
      subtitle: item.email,
      meta: item.fechaRegistro,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : 'default',
    }),
    kpis: item => [
      { label: 'Rol', value: item.rol, icon: <ShieldCheck size={16} />, tone: 'primary' },
      { label: 'Teléfono', value: item.telefono ?? '—', icon: <ShieldCheck size={16} />, tone: 'default' },
      { label: 'Documento', value: item.nit ?? '—', icon: <ShieldCheck size={16} />, tone: 'default' },
      { label: 'Fecha registro', value: item.fechaRegistro, icon: <Calendar size={16} />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Email:</span> {item.email}</div>
        <div className={s.detailRow}><span>Rol:</span> {item.rol}</div>
        <div className={s.detailRow}><span>Teléfono:</span> {item.telefono ?? '—'}</div>
        <div className={s.detailRow}><span>Documento:</span> {item.nit ?? '—'}</div>
        <div className={s.detailRow}><span>Fecha registro:</span> {item.fechaRegistro}</div>
      </div>
    ),
  };

  const actions = ((item: UsuarioConDatos): DataTableAction<UsuarioConDatos>[] => [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (i) => { setSelectedUsuario(i); setModalOpen(true); } },
    { label: 'Activar/Desactivar', icon: <ToggleLeft size={14} />, onClick: async () => {
      try {
        const actualizado = await usersApi.updateStatus(item.id, item.estado === 'Activo' ? 'INACTIVO' : 'ACTIVO');
        setItems(prev => prev.map(it => it.id === item.id ? actualizado : it));
        toast.success(actualizado.estado === 'Activo' ? 'Usuario activado' : 'Usuario desactivado');
      } catch {
        toast.error('No se pudo cambiar el estado del usuario');
      }
    } },
    { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (item) => setDeleteConfirm(item) },
  ]) as DataTableAction<UsuarioConDatos>[] | ((item: UsuarioConDatos) => DataTableAction<UsuarioConDatos>[]);

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Usuarios</h1>
          <p className={s.pageSubtitle}>Usuarios con rol Cliente</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Cliente
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filteredUsuarios}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          toolbarLeft={null}
          maxVisibleColumns={5}
          emptyMessage={loading ? 'Cargando usuarios...' : error ? error : 'No se encontraron usuarios'}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedUsuario ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <form className={s.form} ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmitUsuario(); }}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Nombre completo</label>
              <input type="text" className={s.input} name="nombre" defaultValue={selectedUsuario?.nombre} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input type="email" className={s.input} name="email" defaultValue={selectedUsuario?.email} />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Teléfono</label>
              <input type="tel" className={s.input} name="telefono" defaultValue={selectedUsuario?.telefono ?? ''} maxLength={10} inputMode="numeric" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Documento (NIT)</label>
              <input type="text" className={s.input} name="nit" defaultValue={selectedUsuario?.nit ?? ''} maxLength={10} inputMode="numeric" />
            </div>
          </div>
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : selectedUsuario ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (!deleteConfirm) return;
          try {
            await usersApi.remove(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success('Usuario eliminado');
          } catch {
            toast.error('No se pudo eliminar el usuario');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar usuario"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
