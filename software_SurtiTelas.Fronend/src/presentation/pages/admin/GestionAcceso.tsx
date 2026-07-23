import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ToggleLeft, Loader2 } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './GestionAcceso.module.css';
import { Button } from '../../../shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '../../../shared/ui/DataTable';
import { accessApi, type AccessLog } from '@/infrastructure/api/accessApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { authApi } from '@/infrastructure/api/authApi';
import { rolesApi } from '@/infrastructure/api/rolesApi';
import { TIPOS_PERMISO_ACCESO } from '@/shared/constants/options';

interface Acceso {
  id: string;
  usuario: string;
  rol: string;
  modulo: string;
  permiso: string;
  fechaAsignacion: string;
  expira: string | null;
  estado: 'Activo' | 'Expirado' | 'Pendiente';
}

const formatFecha = (value: string): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const toAcceso = (log: AccessLog): Acceso => ({
  id: log.id,
  usuario: typeof log.usuario === 'object' && log.usuario !== null ? log.usuario.nombre : (log.usuario ?? '—'),
  rol: log.dispositivo ?? '—',
  modulo: log.modulo ?? '—',
  permiso: `${log.accion}${log.ip ? ` · ${log.ip}` : ''}`,
  fechaAsignacion: formatFecha(log.createdAt),
  expira: null,
  estado: log.estado === 'Exitoso' ? 'Activo' : 'Expirado',
} as Acceso);

export const AdminGestionAcceso: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAcceso, setSelectedAcceso] = useState<Acceso | null>(null);
  const [items, setItems] = useState<Acceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [moduloOptions, setModuloOptions] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Acceso | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, rolesData, accessData] = await Promise.all([
          authApi.listUsers(),
          rolesApi.list(),
          accessApi.list(),
        ]);
        setUserOptions(usersData.data.map(u => u.nombre).filter(Boolean));
        setRoleOptions(rolesData.map(r => r.nombre).filter(Boolean));
        setModuloOptions([...new Set(accessData.map(a => a.modulo).filter(Boolean))] as string[]);
        setItems(accessData.map(toAcceso));
      } catch {
        setError('No se pudieron cargar los registros de acceso');
        toast.error('No se pudieron cargar los registros de acceso');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const formRef = useRef<HTMLFormElement>(null);

  const filteredAccesos = useMemo(() => {
    return items.filter(a =>
      a.usuario.toLowerCase().includes(search.toLowerCase()) ||
      a.rol.toLowerCase().includes(search.toLowerCase()) ||
      a.modulo.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAcceso(null);
  };

  const handleSubmitAcceso = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const usuario = String(fd.get('usuario') ?? '').trim();
    const rol = String(fd.get('rol') ?? '').trim();
    const modulo = String(fd.get('modulo') ?? '').trim();
    const permiso = String(fd.get('permiso') ?? '').trim();
    const expiraRaw = String(fd.get('expira') ?? '').trim();
    const expira = expiraRaw === '' ? null : expiraRaw;
    try {
      if (selectedAcceso) {
        await accessApi.update(selectedAcceso.id, { usuario, rol, modulo, accion: permiso, expira });
        setItems(prev => prev.map(it => it.id === selectedAcceso.id ? { ...it, usuario, rol, modulo, permiso, expira } : it));
        toast.success('Acceso actualizado');
      } else {
        const nuevo = await accessApi.create({ usuario, rol, modulo, accion: permiso, expira });
        const nuevoAcceso: Acceso = {
          id: nuevo.id,
          usuario: typeof nuevo.usuario === 'object' && nuevo.usuario !== null ? nuevo.usuario.nombre : (nuevo.usuario ?? usuario),
          rol,
          modulo: nuevo.modulo ?? modulo,
          permiso: `${nuevo.accion}${nuevo.ip ? ` · ${nuevo.ip}` : ''}`,
          fechaAsignacion: formatFecha(nuevo.createdAt),
          expira: expira,
          estado: nuevo.estado === 'Exitoso' ? 'Activo' : 'Expirado',
        };
        setItems(prev => [nuevoAcceso, ...prev]);
        toast.success('Acceso creado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar acceso');
    } finally {
      handleCloseModal();
      void (async () => {
        const data = await accessApi.list();
        setItems(data.map(toAcceso));
      })();
    }
  };

  const columns: DataTableColumn<Acceso>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'usuario', header: 'Usuario', sortable: true },
    { key: 'rol', header: 'Rol', sortable: true },
    { key: 'modulo', header: 'Módulo', sortable: true },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Acceso> = {
    title: item => `Detalle: ${item.usuario}`,
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Módulo:</span> {item.modulo}</div>
        <div className={s.detailRow}><span>Permiso:</span> {item.permiso}</div>
        <div className={s.detailRow}><span>Fecha asignación:</span> {item.fechaAsignacion}</div>
        <div className={s.detailRow}><span>Expira:</span> {item.expira || '-'}</div>
      </div>
    ),
  };

  const actions: DataTableAction<Acceso>[] = [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (item) => { setSelectedAcceso(item); setModalOpen(true); } },
    { label: 'Desactivar', icon: <ToggleLeft size={14} />, onClick: async (item) => {
      try {
        await accessApi.update(item.id, { usuario: item.usuario, rol: item.rol, modulo: item.modulo, accion: item.permiso });
        toast.success(item.estado === 'Activo' ? 'Acceso desactivado' : 'Acceso activado');
        const data = await accessApi.list();
        setItems(data.map(toAcceso));
      } catch {
        toast.error('No se pudo cambiar el estado del acceso');
      }
    } },
    { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (item) => setDeleteConfirm(item) },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Acceso</h1>
          <p className={s.pageSubtitle}>Control de acceso al sistema</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Acceso
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar accesos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.loadingRow}>
            <Loader2 size={18} className={s.spin} />
            <span>Cargando registros de acceso...</span>
          </div>
        )}
        {error && !loading && (
          <div className={s.errorRow}>{error}</div>
        )}
        <DataTable
          data={filteredAccesos}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          toolbarLeft={null}
          maxVisibleColumns={5}
        />
      </div>

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedAcceso ? 'Editar Acceso' : 'Nuevo Acceso'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Usuario</label>
                    <select className={s.select} name="usuario" defaultValue={selectedAcceso?.usuario}>
                      {userOptions.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Rol</label>
                    <select className={s.select} name="rol" defaultValue={selectedAcceso?.rol}>
                      {roleOptions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Módulo</label>
                    <select className={s.select} name="modulo" defaultValue={selectedAcceso?.modulo}>
                      {moduloOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Tipo de Permiso</label>
                    <select className={s.select} name="permiso" defaultValue={selectedAcceso?.permiso}>
                      {TIPOS_PERMISO_ACCESO.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.label}>Fecha de expiración</label>
                  <input type="date" className={s.input} name="expira" defaultValue={selectedAcceso?.expira || ''} />
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitAcceso}>
                    {selectedAcceso ? 'Guardar cambios' : 'Crear acceso'}
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
            await accessApi.delete(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success('Acceso eliminado');
          } catch {
            toast.error('No se pudo eliminar el acceso');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar acceso"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.usuario}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
