import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  EyeOff,
  Trash2,
  Plus,
  Edit,
  Eye,
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
  getAssignmentFromPermissions,
} from '@/shared/config/systemModules';
import s from './GestionRolesPermisos.module.css';
import f from '@/styles/Form.module.css';

const PROTECTED_ROLES = new Set(['ADMIN', 'ASESOR', 'DOMICILIARIO', 'CLIENTE']);

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

  // --- Permissions selection state ---
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectAllPermissions, setSelectAllPermissions] = useState(false);

  // --- Build permission groups from SYSTEM_MODULES (single source of truth) ---
  const permissionGroups = useMemo(() => {
    const apiPermsByCode = new Map<string, Permission>();
    for (const perm of allPermissions) {
      apiPermsByCode.set(perm.code, perm);
    }

    return SYSTEM_MODULES.map((mod) => {
      const permissions: Permission[] = mod.permissionCodes.map((code) => {
        const existing = apiPermsByCode.get(code);
        if (existing) return existing;
        return {
          id: `perm_${code}`,
          code,
          description: code.split(':').pop() || code,
          module: mod.key,
          estado: 'Activo' as const,
        };
      });

      return {
        module: mod.key,
        moduleName: mod.name,
        permissions,
      };
    }).filter(group => group.permissions.length > 0);
  }, [allPermissions]);

  // --- Filtered permission groups ---
  const filteredPermissionGroups = useMemo(() => {
    const search = permissionSearch.toLowerCase();
    if (!search) return permissionGroups;

    return permissionGroups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.code.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.module.toLowerCase().includes(search),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, permissionSearch]);

  // --- Toggle all permissions ---
  const toggleAllPermissions = () => {
    setSelectAllPermissions((prev) => {
      const next = !prev;
      setSelectedPermissionIds(() => {
        if (next) {
          const allIds = new Set<string>();
          for (const group of permissionGroups) {
            for (const perm of group.permissions) {
              allIds.add(perm.id);
            }
          }
          return allIds;
        } else {
          return new Set();
        }
      });
      return next;
    });
  };

  // --- Helpers: convert between permission codes and permission IDs ---
  const rolePermisosToPermissionIds = useCallback(
    (permisoCodes: string[]): string[] => {
      const idSet = new Set<string>();
      for (const code of permisoCodes) {
        const found = allPermissions.find((p) => p.code === code);
        if (found) idSet.add(found.id);
      }
      return Array.from(idSet);
    },
    [allPermissions],
  );

  const rolePermisosToModuleKeys = useCallback(
    (permisoCodes: string[]): string[] => getAssignmentFromPermissions(permisoCodes),
    [],
  );

  // --- Rol form ---
  const handleOpenRolForm = (rol?: Rol | null) => {
    setEditingRol(rol ?? null);
    if (rol) {
      setSelectedPermissionIds(new Set(rolePermisosToPermissionIds(rol.permisos)));
    } else {
      setSelectedPermissionIds(new Set());
    }
    setPermissionSearch('');
    setRolFormOpen(true);
  };

  const handleCloseRolForm = () => {
    setRolFormOpen(false);
    setEditingRol(null);
    setSelectedPermissionIds(new Set());
    setPermissionSearch('');
    rolFormRef.current?.reset();
  };

  const handleSubmitRol = async () => {
    if (!rolFormRef.current) return;
    const fd = new FormData(rolFormRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const descripcion = String(fd.get('descripcion') ?? '').trim();

    if (!nombre) {
      toast.error('No se puede crear un rol sin nombre.');
      return;
    }

    const permissionIds = Array.from(selectedPermissionIds);

    try {
      if (editingRol) {
        await rolesApi.update(editingRol.id, { nombre, descripcion, permisos: permissionIds });
        toast.success('Rol actualizado');
      } else {
        await rolesApi.create({ nombre, descripcion, permisos: permissionIds });
        toast.success('Rol creado');
      }
      void fetchRoles();
      handleCloseRolForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el rol');
    }
  };

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleModulePermissions = (modulePermissions: Permission[], selectAll: boolean) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      for (const perm of modulePermissions) {
        if (selectAll) {
          next.add(perm.id);
        } else {
          next.delete(perm.id);
        }
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
    setSelectedPermissionIds(new Set(rolePermisosToPermissionIds(rol.permisos)));
    setPermissionSearch('');
    setModuleAssignmentOpen(true);
  };

  const saveModuleAssignment = async () => {
    if (!assignmentRol) return;

    const permissionIds = Array.from(selectedPermissionIds);

    try {
      await rolesApi.update(assignmentRol.id, { permisos: permissionIds });
      toast.success('Permisos del rol actualizados');
      void fetchRoles();
    } catch {
      toast.error('No se pudieron actualizar los permisos del rol');
    } finally {
      setModuleAssignmentOpen(false);
      setAssignmentRol(null);
      setSelectedPermissionIds(new Set());
    }
  };

  // --- Module list derived from SYSTEM_MODULES ---
  const moduleList = useMemo(() => {
    const permissionsByCode = new Map<string, Permission>();
    for (const perm of allPermissions) {
      permissionsByCode.set(perm.code, perm);
    }

    return SYSTEM_MODULES.map((mod) => {
      const modPermissions = mod.permissionCodes
        .map((code) => permissionsByCode.get(code))
        .filter(Boolean) as Permission[];
      const allInactive = modPermissions.length > 0 && modPermissions.every((p) => p.estado === 'Inactivo');

      return {
        id: mod.key,
        module: mod.key,
        name: mod.name,
        description: mod.description,
        panel: mod.panel,
        route: mod.route,
        permissionCodes: mod.permissionCodes,
        estado: (allInactive ? 'Inactivo' : 'Activo') as 'Activo' | 'Inactivo',
      };
    }).sort((a, b) => {
      // Sort by panel first, then by name
      const panelOrder: Record<string, number> = { admin: 0, asesor: 1, domiciliario: 2, cliente: 3 };
      const aPanel = panelOrder[a.panel] ?? 99;
      const bPanel = panelOrder[b.panel] ?? 99;
      if (aPanel !== bPanel) return aPanel - bPanel;
      return a.name.localeCompare(b.name);
    });
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
      icon: <Eye size={14} />,
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
    panel: string;
    route: string;
    permissionCodes: string[];
    estado: 'Activo' | 'Inactivo';
  }>[] = [
    {
      key: 'name',
      header: 'Módulo',
      sortable: true,
      minWidth: '180px',
      render: (item) => (
        <div
          style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}
        >
          {item.name}
        </div>
      ),
    },
    {
      key: 'panel',
      header: 'Panel',
      sortable: true,
      width: '110px',
      render: (item) => (
        <Badge
          variant={
            item.panel === 'admin'
              ? 'primary'
              : item.panel === 'asesor'
                ? 'info'
                : item.panel === 'domiciliario'
                  ? 'warning'
                  : 'success'
          }
        >
          {item.panel === 'admin'
            ? 'Admin'
            : item.panel === 'asesor'
              ? 'Asesor'
              : item.panel === 'domiciliario'
                ? 'Domiciliario'
                : 'Cliente'}
        </Badge>
      ),
    },
    {
      key: 'route',
      header: 'Ruta',
      sortable: true,
      minWidth: '160px',
      render: (item) => (
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {item.route}
        </code>
      ),
    },
    {
      key: 'permissionCodes',
      header: 'Permisos',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {item.permissionCodes.slice(0, 3).map((code) => (
            <Badge
              key={code}
              variant="outline"
              className="text-[0.68rem] px-[4px] py-[1px]"
            >
              {code.split(':').pop()}
            </Badge>
          ))}
          {item.permissionCodes.length > 3 && (
            <Badge variant="outline" className="text-[0.68rem] px-[4px] py-[1px]">
              +{item.permissionCodes.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      width: '90px',
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
              Crear rol
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
          </div>
        </div>
      )}

      {/* ===== ROL FORM MODAL (con selección de permisos) ===== */}
      {rolFormOpen && (
        <div className={s.modalOverlay} onClick={() => handleCloseRolForm()}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className={s.modalHeader}>
              <div>
                <h2 className={s.modalTitle}>
                  {editingRol ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {permissionGroups.length} módulos disponibles
                </span>
              </div>
              <button className={s.closeBtn} onClick={handleCloseRolForm}>
                ×
              </button>
            </div>
            <div className={s.modalBody}>
              <form className={f.form} ref={rolFormRef}>
                <div className={f.formSection}>
                  <h3 className={f.sectionTitle}>Información del rol</h3>
                  <div className={f.formRow}>
                    <div className={f.field}>
                      <label className={f.label}>Nombre del Rol *</label>
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
                      rows={3}
                    />
                  </div>
                </div>

                <div className={f.formSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className={f.sectionTitle} style={{ margin: 0 }}>Permisos del rol</h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {selectedPermissionIds.size} / {permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0)} permisos seleccionados
                    </span>
                  </div>

                  <div className={f.field} style={{ marginBottom: '12px' }}>
                    <input
                      className={f.input}
                      type="text"
                      placeholder="Buscar módulo o permiso..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={selectAllPermissions}
                        onChange={toggleAllPermissions}
                      />
                      Seleccionar todos los permisos
                    </label>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    {filteredPermissionGroups.length === 0 ? (
                      <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        No se encontraron permisos
                      </p>
                    ) : (
                      filteredPermissionGroups.map((group) => {
                        const allSelected = group.permissions.every((p) => selectedPermissionIds.has(p.id));
                        const someSelected = group.permissions.some((p) => selectedPermissionIds.has(p.id));

                        return (
                          <div key={group.module} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                backgroundColor: 'var(--color-bg-elevated)',
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                                {group.moduleName.toUpperCase()}
                              </span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  ref={(el) => {
                                    if (el) el.indeterminate = someSelected && !allSelected;
                                  }}
                                  onChange={() => toggleModulePermissions(group.permissions, !allSelected)}
                                />
                                {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                              </label>
                            </div>
                            <table className={s.permissionsTable}>
                              <tbody>
                                {group.permissions.map((perm) => (
                                  <tr key={perm.id}>
                                    <td style={{ width: '30px' }}>
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissionIds.has(perm.id)}
                                        onChange={() => togglePermissionSelection(perm.id)}
                                      />
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-secondary)', width: '140px' }}>
                                      {perm.code}
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                                      {perm.description}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })
      )}
                  </div>
                </div>
              </form>
            </div>
            <div className={s.modalFooter}>
              <Button variant="secondary" type="button" onClick={handleCloseRolForm}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleSubmitRol}>
                {editingRol ? 'Guardar cambios' : ' Crear rol '}
              </Button>
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
                  {(() => {
                    const selectedCodes = allPermissions
                      .filter((p) => selectedPermissionIds.has(p.id))
                      .map((p) => p.code);
                    const moduleKeys = getAssignmentFromPermissions(selectedCodes);
                    return moduleKeys.map((key) => {
                      const mod = MODULE_MAP[key];
                      return (
                        <Badge key={key} variant="outline">
                          {mod?.name ?? key}
                        </Badge>
                      );
                    });
                  })()}
                  {selectedPermissionIds.size === 0 && (
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
                <h3>Buscar permisos</h3>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className={f.input}
                    placeholder="Buscar permisos..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                  />
                </div>

                {filteredPermissionGroups.map((group) => {
                  if (group.permissions.length === 0) return null;
                  return (
                    <div key={group.module} style={{ marginBottom: '14px' }}>
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
                        {group.moduleName}
                      </h4>
                      {group.permissions.map((perm) => {
                        const isSelected = selectedPermissionIds.has(perm.id);
                        return (
                          <label
                            key={perm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
                              marginBottom: '2px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: isSelected
                                ? 'var(--color-accent-dim)'
                                : 'transparent',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermissionSelection(perm.id)}
                            />
                            <div style={{ flex: 1 }}>
                              <code
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.76rem',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {perm.code}
                              </code>
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--color-text-primary)',
                                }}
                              >
                                {perm.description}
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
