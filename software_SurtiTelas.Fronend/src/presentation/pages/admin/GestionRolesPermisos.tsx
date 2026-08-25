import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2, AlertCircle, EyeOff, Trash2, Plus, Edit,
} from 'lucide-react';
import { rolesApi, type Rol } from '@/infrastructure/api/rolesApi';
import { permissionsApi, type Permission } from '@/infrastructure/api/permissionsApi';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { cn } from '@/shared/utils';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { DataTable, DataTableColumn, DataTableAction } from '@/shared/ui/DataTable';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { useDelegatedTooltips } from '@/shared/components/Tooltip';
import s from './GestionRolesPermisos.module.css';
import f from '@/styles/Form.module.css';

const PROTECTED_ROLES = new Set(['ADMIN', 'ASESOR', 'DOMICILIARIO', 'CLIENTE']);

export const AdminGestionRolesPermisos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permisos'>('roles');

  // --- Roles state ---
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const debouncedRoleSearch = useDebouncedValue(roleSearch, 300);

  // --- Permisos state ---
  const [permisos, setPermisos] = useState<Permission[]>([]);
  const [permisosLoading, setPermisosLoading] = useState(false);
  const [permisosError, setPermisosError] = useState<string | null>(null);
  const [permisoSearch, setPermisoSearch] = useState('');
  const debouncedPermisoSearch = useDebouncedValue(permisoSearch, 300);

  // --- Modales y drawers ---
  const [rolFormOpen, setRolFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [rolDetailOpen, setRolDetailOpen] = useState(false);
  const [selectedRolForDetail, setSelectedRolForDetail] = useState<Rol | null>(null);
  const [permManagementOpen, setPermManagementOpen] = useState(false);
  const [permManagementRol, setPermManagementRol] = useState<Rol | null>(null);

  const [permisoFormOpen, setPermisoFormOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState<Permission | null>(null);
  const [permisoDetailOpen, setPermisoDetailOpen] = useState(false);
  const [selectedPermisoForDetail, setSelectedPermisoForDetail] = useState<Permission | null>(null);

  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Rol | null>(null);
  const [deleteConfirmPermiso, setDeleteConfirmPermiso] = useState<Permission | null>(null);

  // --- Permission management within a role ---
  const [allPermisos, setAllPermisos] = useState<Permission[]>([]);
  const [allPermisosLoading, setAllPermisosLoading] = useState(false);
  const [permManagementSearch, setPermManagementSearch] = useState('');
  const [selectedPermisoIds, setSelectedPermisoIds] = useState<Set<string>>(new Set());

  const tableRef = useRef<HTMLDivElement>(null);
  const rolFormRef = useRef<HTMLFormElement>(null);
  const permisoFormRef = useRef<HTMLFormElement>(null);
  useDelegatedTooltips(tableRef, { placement: 'top' });

  // --- Fetch roles ---
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const data = await rolesApi.list();
      setRoles(data);
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : 'No se pudieron cargar los roles');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchPermisos = useCallback(async () => {
    setPermisosLoading(true);
    setPermisosError(null);
    try {
      const result = await permissionsApi.list();
      setPermisos(result.items);
    } catch (err) {
      setPermisosError(err instanceof Error ? err.message : 'No se pudieron cargar los permisos');
    } finally {
      setPermisosLoading(false);
    }
  }, []);

  const fetchAllPermisosForManagement = useCallback(async () => {
    setAllPermisosLoading(true);
    try {
      const result = await permissionsApi.list();
      setAllPermisos(result.items);
    } catch {
      toast.error('No se pudieron cargar los permisos');
    } finally {
      setAllPermisosLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
    void fetchPermisos();
  }, [fetchRoles, fetchPermisos]);

  // --- Filtered lists ---
  const filteredRoles = useMemo(() => {
    return roles.filter(r =>
      String(r.nombre ?? '').toLowerCase().includes(debouncedRoleSearch.toLowerCase()) ||
      String(r.descripcion ?? '').toLowerCase().includes(debouncedRoleSearch.toLowerCase()) ||
      (r.permisos ?? []).some(p => p.toLowerCase().includes(debouncedRoleSearch.toLowerCase()))
    );
  }, [roles, debouncedRoleSearch]);

  const filteredPermisos = useMemo(() => {
    return permisos.filter(p =>
      p.code.toLowerCase().includes(debouncedPermisoSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(debouncedPermisoSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(debouncedPermisoSearch.toLowerCase())
    );
  }, [permisos, debouncedPermisoSearch]);

  // --- Rol form ---
  const handleOpenRolForm = (rol?: Rol | null) => {
    setEditingRol(rol ?? null);
    setRolFormOpen(true);
  };

  const handleCloseRolForm = () => {
    setRolFormOpen(false);
    setEditingRol(null);
    rolFormRef.current?.reset();
  };

  const handleSubmitRol = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rolFormRef.current) return;
    const fd = new FormData(rolFormRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const descripcion = String(fd.get('descripcion') ?? '').trim();

    try {
      if (editingRol) {
        await rolesApi.update(editingRol.id, { nombre, descripcion });
        toast.success('Rol actualizado');
      } else {
        await rolesApi.create({ nombre, descripcion });
        toast.success('Rol creado');
      }
      void fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el rol');
    } finally {
      handleCloseRolForm();
    }
  };

  // --- Permiso form ---
  const handleOpenPermisoForm = (permiso?: Permission | null) => {
    setEditingPermiso(permiso ?? null);
    setPermisoFormOpen(true);
  };

  const handleClosePermisoForm = () => {
    setPermisoFormOpen(false);
    setEditingPermiso(null);
    permisoFormRef.current?.reset();
  };

  const handleSubmitPermiso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!permisoFormRef.current) return;
    const fd = new FormData(permisoFormRef.current);
    const code = String(fd.get('code') ?? '').trim();
    const description = String(fd.get('description') ?? '').trim();
    const module = String(fd.get('module') ?? '').trim();

    try {
      if (editingPermiso) {
        await permissionsApi.update(editingPermiso.id, { code, description, module });
        toast.success('Permiso actualizado');
      } else {
        await permissionsApi.create({ code, description, module });
        toast.success('Permiso creado');
      }
      void fetchPermisos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el permiso');
    } finally {
      handleClosePermisoForm();
    }
  };

  // --- Rol actions ---
  const toggleRolEstado = async (rol: Rol) => {
    const nuevoEstado = rol.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await rolesApi.updateStatus(rol.id, nuevoEstado);
      setRoles(prev => prev.map(r => r.id === rol.id ? { ...r, estado: nuevoEstado } : r));
      toast.success(`Rol ${nuevoEstado.toLowerCase()} correctamente`);
    } catch {
      toast.error('No se pudo actualizar el estado del rol');
    }
  };

  const handleDeleteRol = async (rol: Rol) => {
    if ( PROTECTED_ROLES.has(rol.nombre?.toUpperCase() ?? '')) {
      toast.error('Rol protegido, no se puede eliminar');
      return;
    }
    setDeleteConfirmRole(rol);
  };

  const confirmDeleteRol = async () => {
    if (!deleteConfirmRole) return;
    try {
      await rolesApi.delete(deleteConfirmRole.id);
      setRoles(prev => prev.filter(r => r.id !== deleteConfirmRole.id));
      toast.success('Rol eliminado correctamente');
    } catch {
      toast.error('No se pudo eliminar el rol');
    } finally {
      setDeleteConfirmRole(null);
    }
  };

  // --- Permiso actions ---
  const togglePermisoEstado = async (permiso: Permission) => {
    const nuevoEstado = permiso.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const backendEstado: 'ACTIVO' | 'INACTIVO' = nuevoEstado === 'Activo' ? 'ACTIVO' : 'INACTIVO';
    try {
      await permissionsApi.updateStatus(permiso.id, backendEstado);
      setPermisos(prev => prev.map(p => p.id === permiso.id ? { ...p, estado: nuevoEstado } : p));
      toast.success(`Permiso ${nuevoEstado.toLowerCase()} correctamente`);
    } catch {
      toast.error('No se pudo actualizar el estado del permiso');
    }
  };

  const handleDeletePermiso = (permiso: Permission) => {
    setDeleteConfirmPermiso(permiso);
  };

  const confirmDeletePermiso = async () => {
    if (!deleteConfirmPermiso) return;
    try {
      await permissionsApi.delete(deleteConfirmPermiso.id);
      setPermisos(prev => prev.filter(p => p.id !== deleteConfirmPermiso.id));
      toast.success('Permiso eliminado correctamente');
    } catch {
      toast.error('No se pudo eliminar el permiso');
    } finally {
      setDeleteConfirmPermiso(null);
    }
  };

  // --- Permission management for a role ---
  const openPermManagement = async (rol: Rol) => {
    setPermManagementRol(rol);
    setPermManagementOpen(true);
    setPermManagementSearch('');
    void fetchAllPermisosForManagement();

    const assigned = await rolesApi.listRolePermissions(rol.nombre);
    setSelectedPermisoIds(new Set(assigned));
  };

  const handlePermSelectionChange = (permisoId: string) => {
    const permiso = allPermisos.find(p => p.id === permisoId);
    if (!permiso) return;
    setSelectedPermisoIds(prev => {
      const next = new Set(prev);
      if (next.has(permiso.code)) {
        next.delete(permiso.code);
      } else {
        next.add(permiso.code);
      }
      return next;
    });
  };

  const savePermChanges = async () => {
    if (!permManagementRol) return;

    const rolName = permManagementRol.nombre;
    const currentAssigned = await rolesApi.listRolePermissions(rolName);
    const assignedCodes = new Set(currentAssigned);

    // Add new
    const toAdd = allPermisos.filter(p => selectedPermisoIds.has(p.code) && !assignedCodes.has(p.code));
    // Remove old
    const toRemove = allPermisos.filter(p => !selectedPermisoIds.has(p.code) && assignedCodes.has(p.code));

    try {
      for (const p of toAdd) {
        await rolesApi.assignPermission(rolName, p.id);
      }
      for (const p of toRemove) {
        await rolesApi.removePermission(rolName, p.id);
      }
      toast.success('Permisos del rol actualizados');
      void fetchRoles();
    } catch {
      toast.error('No se pudieron actualizar los permisos del rol');
    } finally {
      setPermManagementOpen(false);
      setPermManagementRol(null);
      setSelectedPermisoIds(new Set());
    }
  };

  const filteredAllPermisos = useMemo(() => {
    return allPermisos.filter(p =>
      p.code.toLowerCase().includes(permManagementSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(permManagementSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(permManagementSearch.toLowerCase())
    );
  }, [allPermisos, permManagementSearch]);

  // --- Role columns ---
  const roleColumns: DataTableColumn<Rol>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      minWidth: '160px',
      render: (item) => (
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
          {item.nombre}
        </div>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      sortable: true,
      render: (item) => (
        <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
          {item.descripcion || '—'}
        </div>
      ),
    },
    {
      key: 'permisos',
      header: 'Permisos',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(item.permisos ?? []).slice(0, 3).map((permiso, idx) => (
                    <Badge key={idx} variant="outline" className="text-[0.72rem] px-[6px] py-[2px]">
                      {permiso}
                    </Badge>
                  ))}
                  {(item.permisos ?? []).length > 3 && (
                    <Badge variant="outline" className="text-[0.72rem] px-[6px] py-[2px]">
                      +{(item.permisos ?? []).length - 3}
                    </Badge>
                  )}
        </div>
      ),
    },
    {
      key: 'usuarios',
      header: 'Usuarios',
      sortable: true,
      align: 'center',
      render: (item) => <span style={{ fontSize: '0.84rem' }}>{item.usuarios}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (item) => (
        <Badge variant={item.estado === 'Activo' ? 'success' : 'danger'}>{item.estado}</Badge>
      ),
    },
  ];

  const roleActions: DataTableAction<Rol>[] = [
    {
      label: 'Ver detalle',
      icon: <Plus size={14} />,
      onClick: (item) => {
        setSelectedRolForDetail(item);
        setRolDetailOpen(true);
      },
    },
    {
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: (item) => handleOpenRolForm(item),
    },
    {
      label: (item) => item.estado === 'Activo' ? 'Desactivar' : 'Activar',
      icon: <EyeOff size={14} />,
      onClick: (item) => void toggleRolEstado(item),
    },
    {
      label: (item) => PROTECTED_ROLES.has((item.nombre ?? '').toUpperCase()) ? 'Protegido' : 'Eliminar',
      icon: <Trash2 size={14} />,
      disabled: (item) => PROTECTED_ROLES.has((item.nombre ?? '').toUpperCase()),
      danger: true,
      onClick: (item) => handleDeleteRol(item),
    },
  ];

  // --- Permiso columns ---
  const permisoColumns: DataTableColumn<Permission>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      minWidth: '180px',
      render: (item) => (
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem', fontFamily: 'monospace' }}>
          {item.code}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      sortable: true,
      render: (item) => (
        <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
          {item.description}
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Módulo',
      sortable: true,
      align: 'center',
      render: (item) => <Badge variant="outline">{item.module}</Badge>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (item) => (
        <Badge variant={item.estado === 'Activo' ? 'success' : 'danger'}>
          {item.estado}
        </Badge>
      ),
    },
  ];

  const permisoActions: DataTableAction<Permission>[] = [
    {
      label: 'Ver detalle',
      icon: <Plus size={14} />,
      onClick: (item) => {
        setSelectedPermisoForDetail(item);
        setPermisoDetailOpen(true);
      },
    },
    {
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: (item) => handleOpenPermisoForm(item),
    },
    {
      label: (item) => item.estado === 'Activo' ? 'Desactivar' : 'Activar',
      icon: <EyeOff size={14} />,
      onClick: (item) => void togglePermisoEstado(item),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (item) => handleDeletePermiso(item),
    },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Roles y Permisos</h1>
          <p className={s.pageSubtitle}>Administre roles, permisos y sus relaciones desde un único lugar</p>
        </div>
      </div>

      <div className={s.tabs}>
        <button
          className={cn(s.tab, activeTab === 'roles' && s.tabActive)}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
        <button
          className={cn(s.tab, activeTab === 'permisos' && s.tabActive)}
          onClick={() => setActiveTab('permisos')}
        >
          Permisos
        </button>
      </div>

      {/* ===== ROLES TAB ===== */}
      {activeTab === 'roles' && (
        <div className={s.tabContent}>
          <div className={s.toolbar}>
            <SearchInput
              placeholder="Buscar roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              onSearch={(v) => setRoleSearch(v)}
              debounceMs={100}
              minChars={0}
            />
            <Button leftIcon={<Plus size={16} />} onClick={() => handleOpenRolForm()}>
              + Crear rol
            </Button>
          </div>

          <div className={s.tableWrapper} ref={tableRef}>
            {rolesLoading && (
              <div className={cn(s.stateBox)}>
                <Loader2 size={28} className={s.spin} />
                <p>Cargando roles...</p>
              </div>
            )}
            {rolesError && (
              <div className={cn(s.stateBox, s.errorBox)}>
                <AlertCircle size={28} />
                <p>{rolesError}</p>
              </div>
            )}
            {!rolesLoading && !rolesError && (
              <DataTable
                enableExport={false}
                enableRowSelection={false}
                data={filteredRoles}
                columns={roleColumns}
                actions={roleActions}
                enableSorting={true}
                enableColumnFilters={false}
                toolbarLeft={null}
                maxVisibleColumns={5}
                emptyMessage="No se encontraron roles"
              />
            )}
          </div>
        </div>
      )}

      {/* ===== PERMISOS TAB ===== */}
      {activeTab === 'permisos' && (
        <div className={s.tabContent}>
          <div className={s.toolbar}>
            <SearchInput
              placeholder="Buscar permisos..."
              value={permisoSearch}
              onChange={(e) => setPermisoSearch(e.target.value)}
              onSearch={(v) => setPermisoSearch(v)}
              debounceMs={100}
              minChars={0}
            />
            <Button leftIcon={<Plus size={16} />} onClick={() => handleOpenPermisoForm()}>
              + Crear permiso
            </Button>
          </div>

          <div className={s.tableWrapper} ref={tableRef}>
            {permisosLoading && (
              <div className={cn(s.stateBox)}>
                <Loader2 size={28} className={s.spin} />
                <p>Cargando permisos...</p>
              </div>
            )}
            {permisosError && (
              <div className={cn(s.stateBox, s.errorBox)}>
                <AlertCircle size={28} />
                <p>{permisosError}</p>
              </div>
            )}
            {!permisosLoading && !permisosError && (
              <DataTable
                enableExport={false}
                enableRowSelection={false}
                data={filteredPermisos}
                columns={permisoColumns}
                actions={permisoActions}
                enableSorting={true}
                enableColumnFilters={false}
                toolbarLeft={null}
                maxVisibleColumns={5}
                emptyMessage="No se encontraron permisos"
              />
            )}
          </div>
        </div>
      )}

      {/* ===== ROL FORM MODAL ===== */}
      {rolFormOpen && (
        <div className={s.modalOverlay} onClick={() => handleCloseRolForm()}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseRolForm}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={f.form} ref={rolFormRef} onSubmit={handleSubmitRol}>
                <div className={f.formSection}>
                  <h3 className={f.sectionTitle}>Información del rol</h3>
                  <div className={f.formRow}>
                    <div className={f.field}>
                      <label className={f.label}>Nombre del Rol</label>
                      <input
                        className={f.input}
                        name="nombre"
                        defaultValue={editingRol?.nombre}
                        placeholder="Ej: VENDEDOR"
                        required
                      />
                    </div>
                  </div>
                  <div className={f.field}>
                    <label className={f.label}>Descripción</label>
                    <textarea
                      className={f.textarea}
                      name="descripcion"
                      defaultValue={editingRol?.descripcion}
                      placeholder="Descripción del rol..."
                    />
                  </div>
                </div>
                <div className={f.formActions}>
                  <Button variant="secondary" type="button" onClick={handleCloseRolForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRol ? 'Guardar cambios' : 'Crear rol'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERMISO FORM MODAL ===== */}
      {permisoFormOpen && (
        <div className={s.modalOverlay} onClick={() => handleClosePermisoForm()}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingPermiso ? 'Editar Permiso' : 'Nuevo Permiso'}
              </h2>
              <button className={s.closeBtn} onClick={handleClosePermisoForm}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={f.form} ref={permisoFormRef} onSubmit={handleSubmitPermiso}>
                <div className={f.formSection}>
                  <h3 className={f.sectionTitle}>Información del permiso</h3>
                  <div className={f.formRow}>
                    <div className={f.field}>
                      <label className={f.label}>Código</label>
                      <input
                        className={f.input}
                        name="code"
                        defaultValue={editingPermiso?.code}
                        placeholder="ej: catalog:read"
                        required
                      />
                    </div>
                    <div className={f.field}>
                      <label className={f.label}>Módulo</label>
                      <input
                        className={f.input}
                        name="module"
                        defaultValue={editingPermiso?.module}
                        placeholder="ej: Catalog"
                        required
                      />
                    </div>
                  </div>
                  <div className={f.field}>
                    <label className={f.label}>Descripción</label>
                    <textarea
                      className={f.textarea}
                      name="description"
                      defaultValue={editingPermiso?.description}
                      placeholder="Descripción del permiso..."
                    />
                  </div>
                </div>
                <div className={f.formActions}>
                  <Button variant="secondary" type="button" onClick={handleClosePermisoForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPermiso ? 'Guardar cambios' : 'Crear permiso'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROL DETAIL DRAWER ===== */}
      {rolDetailOpen && selectedRolForDetail && (
        <div className={s.drawerOverlay} onClick={() => setRolDetailOpen(false)}>
          <div className={s.drawer} onClick={e => e.stopPropagation()}>
            <div className={s.drawerHeader}>
              <h2 className={s.drawerTitle}>Detalle del Rol</h2>
              <button className={s.closeBtn} onClick={() => setRolDetailOpen(false)}>×</button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.detailSection}>
                <h3>Información</h3>
                <dl className={s.detailGrid}>
                  <dt>Nombre</dt><dd>{selectedRolForDetail.nombre}</dd>
                  <dt>Descripción</dt><dd>{selectedRolForDetail.descripcion || '—'}</dd>
                  <dt>Estado</dt><dd>
                    <Badge variant={selectedRolForDetail.estado === 'Activo' ? 'success' : 'danger'}>
                      {selectedRolForDetail.estado}
                    </Badge>
                  </dd>
                  <dt>Usuarios asignados</dt><dd>{selectedRolForDetail.usuarios}</dd>
                </dl>
              </div>
              <div className={s.detailSection}>
                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Permisos ({selectedRolForDetail.permisos?.length ?? 0})
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void openPermManagement(selectedRolForDetail)}
                  >
                    Gestionar permisos
                  </Button>
                </h3>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {selectedRolForDetail.permisos?.length ? (
                    selectedRolForDetail.permisos.map((permiso, idx) => (
                      <Badge key={idx} variant="outline">
                        {permiso}
                      </Badge>
                    ))
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>Sin permisos asignados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERMISO DETAIL DRAWER ===== */}
      {permisoDetailOpen && selectedPermisoForDetail && (
        <div className={s.drawerOverlay} onClick={() => setPermisoDetailOpen(false)}>
          <div className={s.drawer} onClick={e => e.stopPropagation()}>
            <div className={s.drawerHeader}>
              <h2 className={s.drawerTitle}>Detalle del Permiso</h2>
              <button className={s.closeBtn} onClick={() => setPermisoDetailOpen(false)}>×</button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.detailSection}>
                <h3>Información</h3>
                <dl className={s.detailGrid}>
                  <dt>Código</dt><dd>{selectedPermisoForDetail.code}</dd>
                  <dt>Descripción</dt><dd>{selectedPermisoForDetail.description}</dd>
                  <dt>Módulo</dt><dd>{selectedPermisoForDetail.module}</dd>
                  <dt>Estado</dt><dd>
                    <Badge variant={selectedPermisoForDetail.estado === 'Activo' ? 'success' : 'danger'}>
                      {selectedPermisoForDetail.estado}
                    </Badge>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERMISSION MANAGEMENT DRAWER ===== */}
      {permManagementOpen && permManagementRol && (
        <div className={s.drawerOverlay} onClick={() => setPermManagementOpen(false)}>
          <div className={s.drawer} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={s.drawerHeader}>
              <h2 className={s.drawerTitle}>
                Gestionar permisos — {permManagementRol.nombre}
              </h2>
              <button className={s.closeBtn} onClick={() => setPermManagementOpen(false)}>×</button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.detailSection}>
                <h3>Permisos asociados</h3>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {Array.from(selectedPermisoIds).map((code) => (
                    <Badge key={code} variant="outline">
                      {code}
                    </Badge>
                  ))}
                  {selectedPermisoIds.size === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>Selecciona permisos para asignar</p>
                  )}
                </div>
              </div>

              <div className={s.detailSection}>
                <h3>Todos los permisos disponibles</h3>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className={f.input}
                    placeholder="Buscar permisos..."
                    value={permManagementSearch}
                    onChange={(e) => setPermManagementSearch(e.target.value)}
                  />
                </div>
                {allPermisosLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Loader2 size={24} className={s.spin} />
                  </div>
                ) : (
                  <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                    {filteredAllPermisos.map((permiso) => {
                      const isSelected = selectedPermisoIds.has(permiso.code);
                      return (
                        <label
                          key={permiso.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 12px', cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            borderBottom: '1px solid var(--color-border-light)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePermSelectionChange(permiso.id)}
                          />
                          <code style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{permiso.code}</code>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            ({permiso.module}) {permiso.description}
                          </span>
                        </label>
                      );
                    })}
                    {filteredAllPermisos.length === 0 && (
                      <p style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                        No se encontraron permisos
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={s.drawerFooter}>
              <Button variant="secondary" onClick={() => setPermManagementOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={savePermChanges}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRMATION MODALS ===== */}
      <ConfirmationModal
        open={!!deleteConfirmRole}
        onClose={() => setDeleteConfirmRole(null)}
        onConfirm={confirmDeleteRol}
        title="Eliminar rol"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirmRole?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <ConfirmationModal
        open={!!deleteConfirmPermiso}
        onClose={() => setDeleteConfirmPermiso(null)}
        onConfirm={confirmDeletePermiso}
        title="Eliminar permiso"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirmPermiso?.code}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
