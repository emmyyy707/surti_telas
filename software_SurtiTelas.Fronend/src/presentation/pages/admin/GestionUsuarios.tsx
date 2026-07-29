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
import { authApi, type PermissionDTO } from '@/infrastructure/api/authApi';

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
  const [permisosModalOpen, setPermisosModalOpen] = useState(false);
  const [selectedUsuarioPermisos, setSelectedUsuarioPermisos] = useState<UsuarioConDatos | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

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

  useEffect(() => {
    let active = true;
    const loadPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const result = await authApi.listPermissions();
        if (!active) return;
        setPermissions(result.data);
      } catch {
        toast.error('No se pudieron cargar los permisos');
      } finally {
        if (active) setLoadingPermissions(false);
      }
    };
    loadPermissions();
    return () => { active = false; };
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
    const role = String(fd.get('role') ?? 'CLIENTE').toUpperCase();
    const permisos = fd.getAll('permisos') as string[];
    if (!nombre || !email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    if (telefono && !/^[0-9]{1,11}$/.test(telefono)) {
      toast.error('Teléfono inválido. Máximo 11 dígitos numéricos.');
      return;
    }
    if (nit && !/^[0-9]{1,11}$/.test(nit)) {
      toast.error('Documento inválido. Máximo 11 dígitos numéricos.');
      return;
    }
    setSaving(true);
    try {
      if (selectedUsuario) {
        await usersApi.update(selectedUsuario.id, { nombre, telefono, permisos });
        setItems(prev => prev.map(it => it.id === selectedUsuario.id ? { ...it, nombre, telefono, permisos } : it));
        toast.success('Usuario actualizado');
      } else {
        const randomPass = Math.random().toString(36).slice(-8);
        const creado = await usersApi.create({ nombre, email, telefono, role: role as 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE', password: randomPass, permisos });
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
      { label: 'Módulos', value: (item.permisos ?? []).join(', ') || 'Sin módulos', icon: <ShieldCheck size={16} />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Email:</span> {item.email}</div>
        <div className={s.detailRow}><span>Rol:</span> {item.rol}</div>
        <div className={s.detailRow}><span>Teléfono:</span> {item.telefono ?? '—'}</div>
        <div className={s.detailRow}><span>Documento:</span> {item.nit ?? '—'}</div>
        <div className={s.detailRow}><span>Fecha registro:</span> {item.fechaRegistro}</div>
        <div className={s.detailRow}><span>Módulos:</span> {(item.permisos ?? []).join(', ') || 'Sin módulos'}</div>
      </div>
    ),
  };

  const actions: DataTableAction<UsuarioConDatos>[] = [
    {
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: (i) => { setSelectedUsuario(i); setModalOpen(true); },
    },
    {
      label: (item: UsuarioConDatos) => item.estado === 'Activo' ? 'Desactivar' : 'Activar',
      icon: <ToggleLeft size={14} />,
      onClick: async (item: UsuarioConDatos) => {
        try {
          const actualizado = await usersApi.updateStatus(item.id, item.estado === 'Activo' ? 'INACTIVO' : 'ACTIVO');
          setItems(prev => prev.map(it => it.id === item.id ? actualizado : it));
          toast.success(actualizado.estado === 'Activo' ? 'Usuario activado' : 'Usuario desactivado');
        } catch {
          toast.error('No se pudo cambiar el estado del usuario');
        }
      },
    },
    {
      label: 'Permisos',
      icon: <ShieldCheck size={14} />,
      onClick: (item: UsuarioConDatos) => {
        setSelectedUsuarioPermisos(item);
        setUserPermissions(item.permisos ?? []);
        setPermisosModalOpen(true);
      },
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (item: UsuarioConDatos) => setDeleteConfirm(item),
    },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Usuarios</h1>
          <p className={s.pageSubtitle}>Todos los usuarios registrados</p>
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

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              <input type="tel" className={s.input} name="telefono" defaultValue={selectedUsuario?.telefono ?? ''} maxLength={11} inputMode="numeric" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Documento (NIT)</label>
              <input type="text" className={s.input} name="nit" defaultValue={selectedUsuario?.nit ?? ''} maxLength={10} inputMode="numeric" />
            </div>
          </div>
          {!selectedUsuario && (
            <div className={s.formRow}>
              <div className={s.field}>
                <label className={s.label}>Rol</label>
                <select className={s.select} name="role" defaultValue="CLIENTE">
                  <option value="ADMIN">Administrador</option>
                  <option value="ASESOR">Asesor</option>
                  <option value="DOMICILIARIO">Domiciliario</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="ALMACEN">Almacén</option>
                  <option value="PRODUCCION">Producción</option>
                  <option value="REPORTES">Reportes</option>
                </select>
              </div>
            </div>
          )}
          {!selectedUsuario && (
            <div className={s.field}>
              <label className={s.label}>Módulos</label>
              <div className={s.permisosGrid}>
                {Object.entries(
                  permissions.reduce<Record<string, PermissionDTO[]>>((acc, perm) => {
                    const module = perm.module || 'General';
                    if (!acc[module]) acc[module] = [];
                    acc[module].push(perm);
                    return acc;
                  }, {})
                ).map(([module, modPermissions]) => (
                  <div key={module} style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{module}</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {modPermissions.map(perm => (
                        <label key={perm.id} className={s.permisoCheckbox}>
                          <input type="checkbox" name="permisos" value={perm.code} />
                          <span>{perm.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : selectedUsuario ? 'Guardar cambios' : 'Crear usuario'}
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

      <Modal
        open={permisosModalOpen}
        onClose={() => setPermisosModalOpen(false)}
        title={'Gestionar permisos - ' + (selectedUsuarioPermisos?.nombre ?? '')}
        size="lg"
      >
        <div className={s.form}>
          <p className={s.permissionHint}>Asigna permisos específicos a este usuario organizados por módulo.</p>
          {loadingPermissions ? (
            <p>Cargando permisos...</p>
          ) : (
            <div className={s.permisosGrid}>
              {Object.entries(
                permissions.reduce<Record<string, PermissionDTO[]>>((acc, perm) => {
                  const module = perm.module || 'General';
                  if (!acc[module]) acc[module] = [];
                  acc[module].push(perm);
                  return acc;
                }, {})
              ).map(([module, modPermissions]) => (
                <div key={module} style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-primary)' }}>{module}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
                    {modPermissions.map(perm => (
                      <label key={perm.id} className={s.permisoCheckbox}>
                        <input
                          type="checkbox"
                          checked={userPermissions.includes(perm.code)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setUserPermissions(prev =>
                              checked ? [...prev, perm.code] : prev.filter(p => p !== perm.code)
                            );
                          }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.8rem' }}>{perm.code}</strong>
                          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => setPermisosModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!selectedUsuarioPermisos) return;
                try {
                  await usersApi.update(selectedUsuarioPermisos.id, { permisos: userPermissions });
                  setItems(prev => prev.map(u => u.id === selectedUsuarioPermisos.id ? { ...u, permisos: userPermissions } : u));
                  toast.success('Permisos actualizados correctamente');
                  setPermisosModalOpen(false);
                } catch {
                  toast.error('No se pudieron actualizar los permisos');
                }
              }}
            >
              Guardar permisos
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
