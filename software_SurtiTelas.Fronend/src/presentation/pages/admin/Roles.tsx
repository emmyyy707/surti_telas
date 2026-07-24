import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Edit, Shield, Loader2, AlertCircle, EyeOff, Trash2 } from 'lucide-react';
import s from './Roles.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction } from '@/shared/ui/DataTable';
import { useDelegatedTooltips } from '@/shared/components/Tooltip';
import { cn } from '@/shared/utils';
import { rolesApi, type Rol } from '@/infrastructure/api/rolesApi';
import { PERMISOS_SISTEMA } from '@/shared/constants/options';

const PROTECTED_ROLES = new Set(['ADMIN', 'ASESOR']);

const isProtectedRole = (rol: Rol) => PROTECTED_ROLES.has((rol.nombre ?? '').toUpperCase());

const mapBackendRole = (rol: Rol): Rol => ({
  ...rol,
  permisos: rol.permisos ?? [],
});

export const AdminRoles: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [items, setItems] = useState<Rol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tableRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  useDelegatedTooltips(tableRef, { placement: 'top' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await rolesApi.list();
        if (!active) return;
        setItems(data.map(mapBackendRole));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los roles');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredRoles = useMemo(() => {
    return items.filter(r =>
      String(r.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRol(null);
  };

  const handleSubmitRol = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const descripcion = String(fd.get('descripcion') ?? '').trim();
    const permisos = fd.getAll('permisos') as string[];
    try {
      if (selectedRol) {
        await rolesApi.update(selectedRol.id, { nombre, descripcion, permisos });
        setItems(prev => prev.map(it => it.id === selectedRol.id ? { ...it, nombre, descripcion, permisos } : it));
        toast.success('Rol actualizado');
      } else {
        const nuevo = await rolesApi.create({ nombre, descripcion, permisos });
        setItems(prev => [{ ...nuevo, permisos: nuevo.permisos ?? [] }, ...prev]);
        toast.success('Rol creado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar rol');
    } finally {
      handleCloseModal();
      const data = await rolesApi.list();
      setItems(data.map(mapBackendRole));
    }
  };

  const columns: DataTableColumn<Rol>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      minWidth: '180px',
      render: (item: Rol) => (
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
          {item.nombre}
        </div>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      sortable: true,
      render: (item: Rol) => (
        <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
          {item.descripcion || '—'}
        </div>
      ),
    },
    {
      key: 'permisos',
      header: 'Permisos',
      sortable: false,
      render: (item: Rol) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(item.permisos ?? []).slice(0, 3).map((permiso, idx) => (
            <span key={idx} className={cn(s.permisoTag)}>
              <Shield size={12} />
              {permiso}
            </span>
          ))}
          {(item.permisos ?? []).length > 3 && (
            <span className={cn(s.permisoTag)}>+{item.permisos.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'usuarios',
      header: 'Usuarios',
      sortable: true,
      align: 'center',
      render: (item: Rol) => <span style={{ fontSize: '0.84rem' }}>{item.usuarios}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (item: Rol) => (
        <Badge variant={item.estado === 'Activo' ? 'success' : 'default'}>
          {item.estado}
        </Badge>
      ),
    },
  ];

  const actions: DataTableAction<Rol>[] = [
    {
      label: 'Editar',
      icon: <Edit size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Rol) => {
        setSelectedRol(item);
        setModalOpen(true);
      },
    },
    {
      label: (item: Rol) => (isProtectedRole(item) ? 'Protegido' : 'Desactivar'),
      icon: <Trash2 size={14} aria-hidden="true" focusable="false" />,
      disabled: (item: Rol) => isProtectedRole(item),
      onClick: async (item: Rol) => {
        if (isProtectedRole(item)) {
          toast.error('Rol protegido, no se puede eliminar');
          return;
        }
        const nuevoEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
        try {
          await rolesApi.updateStatus(item.id, nuevoEstado);
          setItems(prev => prev.map(it => it.id === item.id ? { ...it, estado: nuevoEstado } : it));
          toast.success(`Rol ${nuevoEstado.toLowerCase()} correctamente`);
        } catch {
          toast.error('No se pudo actualizar el estado del rol');
        }
      },
    },
    {
      label: (item: Rol) => item.estado === 'Activo' ? 'Desactivar' : 'Activar',
      icon: <EyeOff size={14} aria-hidden="true" focusable="false" />,
      onClick: async (item: Rol) => {
        const nuevoEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
        try {
          await rolesApi.updateStatus(item.id, nuevoEstado);
          setItems(prev => prev.map(it => it.id === item.id ? { ...it, estado: nuevoEstado } : it));
          toast.success(`Rol ${nuevoEstado.toLowerCase()} correctamente`);
        } catch {
          toast.error('No se pudo actualizar el estado del rol');
        }
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className={s.pageTitle}>Roles</h1>
          <p className={s.pageSubtitle}>Gestión de roles y permisos del sistema</p>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper} ref={tableRef}>
        {loading && (
          <div className={cn(s.stateBox)}>
            <Loader2 size={28} className={s.spin} />
            <p>Cargando roles...</p>
          </div>
        )}
        {error && (
          <div className={cn(s.stateBox, s.errorBox)}>
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <DataTable<Rol>
            data={filteredRoles}
            columns={columns}
            actions={actions}
            enableExport={false}
            enableRowSelection={false}
            enableSorting={true}
            enableColumnFilters={false}
            toolbarLeft={null}
            maxVisibleColumns={6}
          />
        )}
      </div>

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedRol ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Nombre del Rol</label>
                    <input type="text" className={s.input} name="nombre" defaultValue={selectedRol?.nombre} />
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.label}>Descripción</label>
                  <textarea className={s.textarea} placeholder="Descripción del rol..." name="descripcion" defaultValue={selectedRol?.descripcion} />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Permisos</label>
                  <div className={s.permisosGrid}>
                    {PERMISOS_SISTEMA.map(permiso => (
                      <label key={permiso} className={s.permisoCheckbox}>
                        <input type="checkbox" name="permisos" value={permiso.toLowerCase()} defaultChecked={selectedRol?.permisos.includes(permiso.toLowerCase())} />
                        <Shield size={14} className={s.checkIcon} />
                        <span>{permiso}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitRol}>
                    {selectedRol ? 'Guardar cambios' : 'Crear rol'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
