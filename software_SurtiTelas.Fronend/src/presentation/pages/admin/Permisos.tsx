import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, AlertCircle, EyeOff } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction } from '@/shared/ui/DataTable';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { useDelegatedTooltips } from '@/shared/components/Tooltip';
import { cn } from '@/shared/utils';
import { authApi, type PermissionDTO } from '@/infrastructure/api/authApi';
import { MODULOS_SISTEMA } from '@/shared/constants/options';
import s from './Permisos.module.css';

interface Permiso extends PermissionDTO {
  modulo: string;
}

const mapPermissionToPermiso = (p: PermissionDTO, _index: number): Permiso => {
  return {
    ...p,
    modulo: p.module,
  };
};

export const AdminPermisos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [items, setItems] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Permiso | null>(null);

  const tableRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  useDelegatedTooltips(tableRef, { placement: 'top' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await authApi.listPermissions();
        if (!active) return;
        setItems(data.map((p, idx) => mapPermissionToPermiso(p, idx)));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los permisos');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredPermisos = useMemo(() => {
    return items.filter(p =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.module.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPermiso(null);
  };

  const handleSubmitPermiso = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const code = String(fd.get('code') ?? '').trim();
    const description = String(fd.get('description') ?? '').trim();
    const module = String(fd.get('module') ?? '').trim();
    try {
      if (selectedPermiso) {
        await authApi.updatePermission(selectedPermiso.id, { code, description, module });
        setItems(prev => prev.map(it => it.id === selectedPermiso.id ? { ...it, code, description, module } : it));
        toast.success('Permiso actualizado');
      } else {
        const nuevo = await authApi.createPermission({ code, description, module });
        setItems(prev => [{ ...nuevo, modulo: nuevo.module }, ...prev]);
        toast.success('Permiso creado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar permiso');
    } finally {
      handleCloseModal();
      const data = await authApi.listPermissions();
      setItems(data.map((p, idx) => mapPermissionToPermiso(p, idx)));
    }
  };

  const columns: DataTableColumn<Permiso>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      minWidth: '200px',
      render: (item: Permiso) => (
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
          {item.code}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      sortable: true,
      render: (item: Permiso) => (
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
      render: (item: Permiso) => (
        <Badge variant="outline">{item.module}</Badge>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (item: Permiso) => (
        <Badge variant={item.estado === 'ACTIVO' ? 'success' : 'default'}>
          {item.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  const toggleEstado = async (item: Permiso) => {
    const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await authApi.updatePermissionStatus(item.id, nuevoEstado);
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, estado: nuevoEstado } : it));
      toast.success(`Permiso ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`);
    } catch {
      toast.error('No se pudo actualizar el estado del permiso');
    }
  };

  const actions: DataTableAction<Permiso>[] = [
    {
      label: (item: Permiso) => item.estado === 'ACTIVO' ? 'Desactivar' : 'Activar',
      icon: <EyeOff size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Permiso) => void toggleEstado(item),
    },
    {
      label: 'Editar',
      icon: <Edit size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Permiso) => {
        setSelectedPermiso(item);
        setModalOpen(true);
      },
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={14} aria-hidden="true" focusable="false" />,
      danger: true,
      onClick: (item: Permiso) => setDeleteConfirm(item),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className={s.pageTitle}>Permisos</h1>
          <p className={s.pageSubtitle}>Gestión de permisos del sistema</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => { setSelectedPermiso(null); setModalOpen(true); }}>
          Nuevo Permiso
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar permisos..."
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
            <p>Cargando permisos...</p>
          </div>
        )}
        {error && (
          <div className={cn(s.stateBox, s.errorBox)}>
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <DataTable<Permiso>
            data={filteredPermisos}
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
                {selectedPermiso ? 'Editar Permiso' : 'Nuevo Permiso'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Código del Permiso</label>
                    <input type="text" className={s.input} name="code" defaultValue={selectedPermiso?.code} placeholder="ej: catalog:read" />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Módulo</label>
                    <select className={s.select} name="module" defaultValue={selectedPermiso?.module}>
                      {MODULOS_SISTEMA.map(modulo => (
                        <option key={modulo} value={modulo.toLowerCase()}>{modulo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.label}>Descripción</label>
                  <textarea className={s.textarea} placeholder="Descripción del permiso..." name="description" defaultValue={selectedPermiso?.description} />
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitPermiso}>
                    {selectedPermiso ? 'Guardar cambios' : 'Crear permiso'}
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
            await authApi.deletePermission(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success('Permiso eliminado');
          } catch {
            toast.error('No se pudo eliminar el permiso');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar permiso"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.code}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
