import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  EyeOff,
  Trash2,
  Plus,
  Edit,
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
import {
  SYSTEM_MODULES,
  MODULE_MAP,
  CATEGORY_LABELS,
  getAssignmentFromPermissions,
  getPermissionIdsForModules,
  type ModuleCategory,
} from '@/shared/config/systemModules';
import s from './GestionRolesPermisos.module.css';
import f from '@/styles/Form.module.css';

const PROTECTED_ROLES = new Set(['ADMIN', 'ASESOR', 'DOMICILIARIO', 'CLIENTE']);

interface ModuleGroup {
  category: ModuleCategory;
  modules: typeof SYSTEM_MODULES;
}

function groupModulesByCategory(): ModuleGroup[] {
  const grouped: Record<string, typeof SYSTEM_MODULES> = {};
  for (const mod of SYSTEM_MODULES) {
    if (!grouped[mod.category]) grouped[mod.category] = [];
    grouped[mod.category].push(mod);
  }
  return Object.entries(grouped).map(([category, modules]) => ({
    category: category as ModuleCategory,
    modules,
  }));
}

const MODULE_GROUPS = groupModulesByCategory();

export const AdminGestionRolesPermisos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'modules'>('roles');

  // --- Roles state ---
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const debouncedRoleSearch = useDebouncedValue(roleSearch, 300);

  // --- Permissions state (needed for module assignment) ---
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // --- Modales y drawers ---
  const [rolFormOpen, setRolFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [rolDetailOpen, setRolDetailOpen] = useState(false);
  const [selectedRolForDetail, setSelectedRolForDetail] = useState<Rol | null>(null);
  const [moduleAssignmentOpen, setModuleAssignmentOpen] = useState(false);
  const [assignmentRol, setAssignmentRol] = useState<Rol | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [moduleSearch, setModuleSearch] = useState('');

  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Rol | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const rolFormRef = useRef<HTMLFormElement>(null);
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

  // --- Fetch all permissions (needed for module assignment + module list) ---
  const fetchAllPermissions = useCallback(async () => {
    setPermissionsLoading(true);
    try {
      const result = await permissionsApi.list();
      setAllPermissions(result.items);
    } catch {
      toast.error('No se pudieron cargar los permisos del sistema');
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
    void fetchAllPermissions();
  }, [fetchRoles, fetchAllPermissions]);

  // --- Filtered lists ---
  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      String(r.nombre ?? '').toLowerCase().includes(debouncedRoleSearch.toLowerCase()) ||
      String(r.descripcion ?? '').toLowerCase().includes(debouncedRoleSearch.toLowerCase()),
    );
  }, [roles, debouncedRoleSearch]);

  // --- Module groups filtered by search ---
  const filteredModuleGroups = useMemo(() => {
    const search = moduleSearch.toLowerCase();
    if (!search) return MODULE_GROUPS;

    return MODULE_GROUPS.map((group) => ({
      ...group,
      modules: group.modules.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.key.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search),
      ),
    })).filter((group) => group.modules.length > 0);
  }, [moduleSearch]);

  // --- Helpers: convert between permission codes and module keys ---
  const rolePermisosToModuleKeys = useCallback(
    (permisoCodes: string[]): string[] => getAssignmentFromPermissions(permisoCodes),
    [],
  );

  const moduleKeysToPermissionIds = useCallback(
    (moduleKeys: string[]): string[] => getPermissionIdsForModules(allPermissions, moduleKeys),
    [allPermissions],
  );

  // --- Rol form ---
  const handleOpenRolForm = (rol?: Rol | null) => {
    setEditingRol(rol ?? null);
    if (rol) {
      setSelectedModules(new Set(rolePermisosToModuleKeys(rol.permisos)));
    } else {
      setSelectedModules(new Set());
    }
    setRolFormOpen(true);
  };

  const handleCloseRolForm = () => {
    setRolFormOpen(false);
    setEditingRol(null);
    setSelectedModules(new Set());
    rolFormRef.current?.reset();
  };

  const handleSubmitRol = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rolFormRef.current) return;
    const fd = new FormData(rolFormRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const descripcion = String(fd.get('descripcion') ?? '').trim();

    const permissionIds = moduleKeysToPermissionIds(Array.from(selectedModules));

    try {
      if (editingRol) {
        await rolesApi.update(editingRol.id, { nombre, descripcion, permisos: permissionIds });
        toast.success('Rol actualizado');
      } else {
        await rolesApi.create({ nombre, descripcion, permisos: permissionIds });
        toast.success('Rol creado');
      }
      void fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el rol');
    } finally {
      handleCloseRolForm();
    }
  };

  const toggleModuleSelection = (moduleKey: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  };

  // --- Rol actions ---
  const toggleRolEstado = async (rol: Rol) => {
    const nuevoEstado = rol.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await rolesApi.updateStatus(rol.id, nuevoEstado);
      setRoles((prev) =>
        prev.map((r) =>
          r.id === rol.id ? { ...r, estado: nuevoEstado } : r,
        ),
      );
      toast.success(`Rol ${nuevoEstado.toLowerCase()} correctamente`);
    } catch {
      toast.error('No se pudo actualizar el estado del rol');
    }
  };

  const handleDeleteRol = (rol: Rol) => {
    if (PROTECTED_ROLES.has(rol.nombre?.toUpperCase() ?? '')) {
      toast.error('Rol protegido, no se puede eliminar');
      return;
    }
    setDeleteConfirmRole(rol);
  };

  const confirmDeleteRol = async () => {
    if (!deleteConfirmRole) return;
    try {
      await rolesApi.delete(deleteConfirmRole.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteConfirmRole.id));
      toast.success('Rol eliminado correctamente');
    } catch {
      toast.error('No se pudo eliminar el rol');
    } finally {
      setDeleteConfirmRole(null);
    }
  };

  // --- Module assignment drawer ---
  const openModuleAssignment = (rol: Rol) => {
    setAssignmentRol(rol);
    const currentModules = rolePermisosToModuleKeys(rol.permisos);
    setSelectedModules(new Set(currentModules));
    setModuleSearch('');
    setModuleAssignmentOpen(true);
  };

  const saveModuleAssignment = async () => {
    if (!assignmentRol) return;

    const permissionIds = moduleKeysToPermissionIds(Array.from(selectedModules));

    try {
      await rolesApi.update(assignmentRol.id, { permisos: permissionIds });
      toast.success('Módulos del rol actualizados');
      void fetchRoles();
    } catch {
      toast.error('No se pudieron actualizar los módulos del rol');
    } finally {
      setModuleAssignmentOpen(false);
      setAssignmentRol(null);
      setSelectedModules(new Set());
    }
  };

  // --- Module list derived from permissions API ---
  const moduleList = useMemo(() => {
    const modulesByKey = new Map<string, Permission[]>();
    for (const perm of allPermissions) {
      if (!modulesByKey.has(perm.module)) {
        modulesByKey.set(perm.module, []);
      }
      modulesByKey.get(perm.module)!.push(perm);
    }

    const result: Array<{
      id: string;
      module: string;
      name: string;
      description: string;
      permissionCodes: string[];
      estado: 'Activo' | 'Inactivo';
    }> = [];

    for (const [moduleKey, perms] of modulesByKey.entries()) {
      const sysModule = MODULE_MAP[moduleKey];
      const allInactive = perms.every((p) => p.estado === 'Inactivo');
      result.push({
        id: moduleKey,
        module: moduleKey,
        name: sysModule?.name ?? moduleKey,
        description: sysModule?.description ?? '',
        permissionCodes: perms.map((p) => p.code),
        estado: allInactive ? 'Inactivo' : 'Activo',
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [allPermissions]);

  const filteredModuleList = useMemo(() => {
    const search = debouncedRoleSearch.toLowerCase();
    if (!search) return moduleList;
    return moduleList.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.module.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search),
    );
  }, [moduleList, debouncedRoleSearch]);

  // --- Role columns ---
  const roleColumns: DataTableColumn<Rol>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      minWidth: '160px',
      render: (item) => (
        <div
          style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}
        >
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
      header: 'Módulos',
      sortable: false,
      render: (item) => {
        const moduleKeys = rolePermisosToModuleKeys(item.permisos);
        const visible = moduleKeys.slice(0, 4);
        const extra = moduleKeys.length - 4;
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {visible.map((key) => {
              const mod = MODULE_MAP[key];
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-[0.72rem] px-[6px] py-[2px]"
                >
                  {mod?.name ?? key}
                </Badge>
              );
            })}
            {extra > 0 && (
              <Badge variant="outline" className="text-[0.72rem] px-[6px] py-[2px]">
                +{extra}
              </Badge>
            )}
            {moduleKeys.length === 0 && (
              <span
                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
              >
                Sin módulos
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'usuarios',
      header: 'Usuarios',
      sortable: true,
      align: 'center',
      render: (item) => (
        <span style={{ fontSize: '0.84rem' }}>{item.usuarios}</span>
      ),
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
      label: (item) => (item.estado === 'Activo' ? 'Desactivar' : 'Activar'),
      icon: <EyeOff size={14} />,
      onClick: (item) => void toggleRolEstado(item),
    },
    {
      label: (item) =>
        PROTECTED_ROLES.has((item.nombre ?? '').toUpperCase())
          ? 'Protegido'
          : 'Eliminar',
      icon: <Trash2 size={14} />,
      disabled: (item) =>
        PROTECTED_ROLES.has((item.nombre ?? '').toUpperCase()),
      danger: true,
      onClick: (item) => handleDeleteRol(item),
    },
  ];

  // --- Module list columns ---
  const moduleColumns: DataTableColumn<{
    id: string;
    module: string;
    name: string;
    description: string;
    permissionCodes: string[];
    estado: 'Activo' | 'Inactivo';
  }>[] = [
    {
      key: 'name',
      header: 'Módulo',
      sortable: true,
      minWidth: '200px',
      render: (item) => (
        <div
          style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}
        >
          {item.name}
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Código',
      sortable: true,
      render: (item) => (
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {item.module}
        </code>
      ),
    },
    {
      key: 'permissionCodes',
      header: 'Permisos',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {item.permissionCodes.map((code) => (
            <Badge
              key={code}
              variant="outline"
              className="text-[0.68rem] px-[4px] py-[1px]"
            >
              {code}
            </Badge>
          ))}
        </div>
      ),
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

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Roles y Permisos</h1>
          <p className={s.pageSubtitle}>
            Administre roles, asigne módulos del sistema y visualice el catálogo de
            módulos disponibles desde un único lugar
          </p>
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
          className={cn(s.tab, activeTab === 'modules' && s.tabActive)}
          onClick={() => setActiveTab('modules')}
        >
          Módulos del Sistema
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

      {/* ===== MODULES TAB ===== */}
      {activeTab === 'modules' && (
        <div className={s.tabContent}>
          <div className={s.toolbar}>
            <SearchInput
              placeholder="Buscar módulos..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              onSearch={(v) => setRoleSearch(v)}
              debounceMs={100}
              minChars={0}
            />
          </div>

          <div className={s.tableWrapper}>
            {permissionsLoading && (
              <div className={cn(s.stateBox)}>
                <Loader2 size={28} className={s.spin} />
                <p>Cargando módulos del sistema...</p>
              </div>
            )}
            {!permissionsLoading && (
              <DataTable
                enableExport={false}
                enableRowSelection={false}
                data={filteredModuleList}
                columns={moduleColumns}
                actions={[]}
                enableSorting={true}
                enableColumnFilters={false}
                toolbarLeft={null}
                maxVisibleColumns={5}
                emptyMessage="No se encontraron módulos"
              />
            )}

            <div className={s.modulesNote}>
              <AlertCircle size={16} />
              <span>
                Los módulos son definidos por el sistema y no pueden crearse, editarse
                o eliminarse desde esta interfaz. Los permisos asociados a cada módulo
                se gestionan a través de los roles.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROL FORM MODAL (con selección de módulos) ===== */}
      {rolFormOpen && (
        <div className={s.modalOverlay} onClick={() => handleCloseRolForm()}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseRolForm}>
                ×
              </button>
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
                        placeholder="Ej: ALMACEN"
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

                <div className={f.formSection}>
                  <h3 className={f.sectionTitle}>Módulos asignados</h3>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '12px',
                    }}
                  >
                    Seleccione los módulos a los que este rol tendrá acceso:
                  </p>

                  {MODULE_GROUPS.map((group) => {
                    const visibleModules =
                      moduleSearch.toLowerCase() === ''
                        ? group.modules
                        : group.modules.filter(
                            (m) =>
                              m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                              m.key.toLowerCase().includes(moduleSearch.toLowerCase()),
                          );
                    if (visibleModules.length === 0 && moduleSearch) return null;

                    return (
                      <div
                        key={group.category}
                        style={{ marginBottom: '16px' }}
                      >
                        <h4
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {CATEGORY_LABELS[group.category]}
                        </h4>
                        {visibleModules.map((mod) => {
                          const isSelected = selectedModules.has(mod.key);
                          return (
                            <label
                              key={mod.key}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                padding: '8px 12px',
                                marginBottom: '4px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: isSelected
                                  ? 'rgba(59, 130, 246, 0.1)'
                                  : 'transparent',
                                border: `1px solid ${
                                  isSelected
                                    ? 'rgba(59, 130, 246, 0.3)'
                                    : 'var(--color-border-light)'
                                }`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleModuleSelection(mod.key)}
                                style={{ marginTop: '2px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: '0.86rem',
                                    color: 'var(--color-text-primary)',
                                  }}
                                >
                                  {mod.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--color-text-secondary)',
                                  }}
                                >
                                  {mod.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}

                  {moduleSearch && selectedModules.size === 0 && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        padding: '8px',
                      }}
                    >
                      No se seleccionaron módulos
                    </p>
                  )}
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

      {/* ===== ROL DETAIL DRAWER ===== */}
      {rolDetailOpen && selectedRolForDetail && (
        <div className={s.drawerOverlay} onClick={() => setRolDetailOpen(false)}>
          <div className={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={s.drawerHeader}>
              <h2 className={s.drawerTitle}>Detalle del Rol</h2>
              <button className={s.closeBtn} onClick={() => setRolDetailOpen(false)}>
                ×
              </button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.detailSection}>
                <h3>Información</h3>
                <dl className={s.detailGrid}>
                  <dt>Nombre</dt>
                  <dd>{selectedRolForDetail.nombre}</dd>
                  <dt>Descripción</dt>
                  <dd>{selectedRolForDetail.descripcion || '—'}</dd>
                  <dt>Estado</dt>
                  <dd>
                    <Badge
                      variant={
                        selectedRolForDetail.estado === 'Activo' ? 'success' : 'danger'
                      }
                    >
                      {selectedRolForDetail.estado}
                    </Badge>
                  </dd>
                  <dt>Usuarios asignados</dt>
                  <dd>{selectedRolForDetail.usuarios}</dd>
                </dl>
              </div>

              <div className={s.detailSection}>
                <h3
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    Módulos asignados (
                    {rolePermisosToModuleKeys(selectedRolForDetail.permisos).length})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRolDetailOpen(false);
                      void openModuleAssignment(selectedRolForDetail);
                    }}
                  >
                    Asignar módulos
                  </Button>
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                    marginTop: '8px',
                  }}
                >
                  {rolePermisosToModuleKeys(selectedRolForDetail.permisos).length ? (
                    rolePermisosToModuleKeys(selectedRolForDetail.permisos).map((key) => {
                      const mod = MODULE_MAP[key];
                      return (
                        <Badge key={key} variant="outline">
                          {mod?.name ?? key}
                        </Badge>
                      );
                    })
                  ) : (
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.84rem',
                      }}
                    >
                      Sin módulos asignados
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODULE ASSIGNMENT DRAWER ===== */}
      {moduleAssignmentOpen && assignmentRol && (
        <div className={s.drawerOverlay} onClick={() => setModuleAssignmentOpen(false)}>
          <div
            className={s.drawer}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px' }}
          >
            <div className={s.drawerHeader}>
              <h2 className={s.drawerTitle}>
                Asignar módulos — {assignmentRol.nombre}
              </h2>
              <button className={s.closeBtn} onClick={() => setModuleAssignmentOpen(false)}>
                ×
              </button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.detailSection}>
                <h3>Módulos seleccionados</h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                  }}
                >
                  {Array.from(selectedModules).map((key) => {
                    const mod = MODULE_MAP[key];
                    return (
                      <Badge key={key} variant="outline">
                        {mod?.name ?? key}
                      </Badge>
                    );
                  })}
                  {selectedModules.size === 0 && (
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.84rem',
                      }}
                    >
                      Selecciona módulos para asignar
                    </p>
                  )}
                </div>
              </div>

              <div className={s.detailSection}>
                <h3>Buscar módulo</h3>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className={f.input}
                    placeholder="Buscar módulos..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                  />
                </div>

                {filteredModuleGroups.map((group) => {
                  if (group.modules.length === 0) return null;
                  return (
                    <div key={group.category} style={{ marginBottom: '14px' }}>
                      <h4
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {CATEGORY_LABELS[group.category]}
                      </h4>
                      {group.modules.map((mod) => {
                        const isSelected = selectedModules.has(mod.key);
                        return (
                          <label
                            key={mod.key}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              padding: '8px 12px',
                              marginBottom: '4px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: isSelected
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'transparent',
                              borderBottom:
                                '1px solid var(--color-border-light)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleModuleSelection(mod.key)}
                              style={{ marginTop: '2px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: '0.84rem',
                                  color: 'var(--color-text-primary)',
                                }}
                              >
                                {mod.name}
                              </div>
                              <code
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.76rem',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {mod.key}
                              </code>
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {mod.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={s.drawerFooter}>
              <Button variant="secondary" onClick={() => setModuleAssignmentOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveModuleAssignment}>Guardar cambios</Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRMATION MODAL (delete role) ===== */}
      <ConfirmationModal
        open={!!deleteConfirmRole}
        onClose={() => setDeleteConfirmRole(null)}
        onConfirm={confirmDeleteRol}
        title="Eliminar rol"
        description={
          deleteConfirmRole
            ? `¿Estás seguro de que deseas eliminar "${deleteConfirmRole.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
