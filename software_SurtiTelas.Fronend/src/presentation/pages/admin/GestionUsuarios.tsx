import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, User, ShieldCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import s from './GestionUsuarios.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { usersApi, type Usuario } from '@/infrastructure/api/usersApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ROL_LABELS, ROLES_SISTEMA, ESTADOS_GENERALES } from '@/shared/constants/options';
import { isValidPhone } from '@/shared/utils/phone';

const roleToBackend: Record<string, 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE'> = {
  ADMIN: 'ADMIN',
  ASESO: 'ASESOR',
  ASESOR: 'ASESOR',
  DOMICILIARIO: 'DOMICILIARIO',
  CLIENTE: 'CLIENTE',
};

export const AdminGestionUsuarios: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Usuario | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      setItems(data);
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
    const rolLabel = String(fd.get('rol') ?? '').trim();
    const rol = roleToBackend[rolLabel] ?? 'ASESOR';
    if (!nombre || !email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    if (telefono && !isValidPhone(telefono)) {
      toast.error('Teléfono inválido. Usa formato: 3001234567 o +573001234567');
      return;
    }
    setSaving(true);
    try {
      if (selectedUsuario) {
        const actualizado = await usersApi.updateStatus(
          selectedUsuario.id,
          selectedUsuario.estado === 'Activo' ? 'INACTIVO' : 'ACTIVO'
        );
        setItems(prev => prev.map(it => it.id === selectedUsuario.id ? actualizado : it));
        toast.success('Usuario actualizado');
      } else {
        const randomPass = Math.random().toString(36).slice(-8);
        const creado = await usersApi.create({ nombre, email, telefono, role: rol, password: randomPass });
        setItems(prev => [creado, ...prev]);
        toast.success('Usuario creado');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<Usuario>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'rol', header: 'Rol', sortable: true },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Usuario> = {
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
      { label: 'Fecha registro', value: item.fechaRegistro, icon: <Calendar size={16} />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Email:</span> {item.email}</div>
        <div className={s.detailRow}><span>Rol:</span> {item.rol}</div>
        <div className={s.detailRow}><span>Fecha registro:</span> {item.fechaRegistro}</div>
      </div>
    ),
  };

  const actions = ((item: Usuario): DataTableAction<Usuario>[] => [
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
  ]) as DataTableAction<Usuario>[] | ((item: Usuario) => DataTableAction<Usuario>[]);

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Usuarios</h1>
          <p className={s.pageSubtitle}>Administración de usuarios del sistema</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Usuario
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

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Nombre completo</label>
                    <input type="text" className={s.input} name="nombre" defaultValue={selectedUsuario?.nombre} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Rol</label>
                    <select className={s.select} name="rol" defaultValue={selectedUsuario?.rol}>
                      {ROLES_SISTEMA.map(rol => (
                        <option key={rol} value={rol}>{ROL_LABELS[rol] ?? rol}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Email</label>
                    <input type="email" className={s.input} name="email" defaultValue={selectedUsuario?.email} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Teléfono</label>
                    <input type="tel" className={s.input} name="telefono" defaultValue={selectedUsuario ? '' : ''} />
                  </div>
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitUsuario} disabled={saving}>
                    {saving ? 'Guardando...' : selectedUsuario ? 'Guardar cambios' : 'Crear usuario'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
