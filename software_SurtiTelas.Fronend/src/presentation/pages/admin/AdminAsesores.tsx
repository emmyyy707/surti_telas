import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, User, Users, BarChart3, Calendar } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './AdminAsesores.module.css';
import { Button } from '../../../shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '../../../shared/ui/DataTable';
import { authApi, type BackendAuthUser } from '@/infrastructure/api/authApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ESTADOS_GENERALES } from '@/shared/constants/options';

interface Asesor {
  id: string;
  nombre: string;
  email: string;
  tel: string | null;
  clientes: number;
  comisiones: string | null;
  estado: 'Activo' | 'Inactivo';
}

const toAsesor = (u: BackendAuthUser): Asesor => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  tel: null,
  clientes: 0,
  comisiones: null,
  estado: 'Activo',
});

export const AdminAsesores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsesor, setSelectedAsesor] = useState<Asesor | null>(null);
  const [items, setItems] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Asesor | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const fetchAsesores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.listUsers();
      const asesores = data.data
        .filter(u => u.role === 'ASESOR')
        .map(toAsesor);
      setItems(asesores);
    } catch {
      setError('No se pudieron cargar los asesores');
      toast.error('No se pudieron cargar los asesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAsesores();
  }, []);

  const filteredAsesores = items.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitAsesor = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const tel = String(fd.get('tel') ?? '').trim();
    const estado = (String(fd.get('estado') ?? 'Activo') || 'Activo') as Asesor['estado'];
    try {
      if (selectedAsesor) {
        await authApi.updateUser(selectedAsesor.id, { nombre, telefono: tel || null });
        setItems(prev => prev.map(it => it.id === selectedAsesor.id ? { ...it, nombre, email, tel: tel || null, estado } : it));
        toast.success('Asesor actualizado');
      } else {
        const randomPass = Math.random().toString(36).slice(-8);
        await authApi.createUser({ email, password: randomPass, nombre, role: 'ASESOR' });
        const nuevo: Asesor = {
          id: `AS-${String(items.length + 1).padStart(3, '0')}`,
          nombre,
          email,
          tel: tel || null,
          clientes: 0,
          comisiones: null,
          estado,
        };
        setItems(prev => [nuevo, ...prev]);
        toast.success('Asesor creado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar asesor');
    } finally {
      setModalOpen(false);
      setSelectedAsesor(null);
      void fetchAsesores();
    }
  };

  const columns: DataTableColumn<Asesor>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'clientes', header: 'Clientes', sortable: true, align: 'right' },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Asesor> = {
    title: item => `Detalle: ${item.nombre}`,
    size: 'lg',
    header: item => ({
      icon: <User size={18} aria-hidden="true" focusable="false" />,
      title: 'Asesor comercial',
      code: item.id,
      subtitle: item.email,
      meta: `${item.clientes} clientes activos`,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : 'default',
    }),
    kpis: item => [
      { label: 'Clientes', value: item.clientes, icon: <Users size={16} aria-hidden="true" focusable="false" />, tone: 'primary' },
      { label: 'Comisiones', value: item.comisiones, icon: <BarChart3 size={16} aria-hidden="true" focusable="false" />, tone: 'success' },
      { label: 'Estado', value: item.estado, icon: <Calendar size={16} aria-hidden="true" focusable="false" />, tone: item.estado === 'Activo' ? 'success' : 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Teléfono:</span> {item.tel || '—'}</div>
        <div className={s.detailRow}><span>Comisiones:</span> {item.comisiones || 'Sin dato'}</div>
        <div className={s.detailRow}><span>Email:</span> {item.email}</div>
        <div className={s.detailRow}><span>Clientes:</span> {item.clientes}</div>
      </div>
    ),
  };

  const actions: DataTableAction<Asesor>[] = [
    { label: 'Editar', icon: <Edit size={14} aria-hidden="true" focusable="false" />, onClick: (item) => { setSelectedAsesor(item); setModalOpen(true); } },
    { label: 'Eliminar', icon: <Trash2 size={14} aria-hidden="true" focusable="false" />, danger: true, onClick: (item) => setDeleteConfirm(item) },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Asesores</h1>
          <p className={s.pageSubtitle}>Gestión del equipo de asesores comerciales</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Asesor
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar asesores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filteredAsesores}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          toolbarLeft={null}
          maxVisibleColumns={5}
          emptyMessage={loading ? 'Cargando asesores...' : error ? error : 'No se encontraron asesores'}
        />
      </div>

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedAsesor ? 'Editar Asesor' : 'Nuevo Asesor'}
              </h2>
              <button className={s.closeBtn} onClick={() => { setModalOpen(false); setSelectedAsesor(null); }}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Nombre</label>
                    <input type="text" className={s.input} name="nombre" defaultValue={selectedAsesor?.nombre} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Email</label>
                    <input type="email" className={s.input} name="email" defaultValue={selectedAsesor?.email} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Teléfono</label>
                     <input type="text" className={s.input} name="tel" defaultValue={selectedAsesor?.tel ?? ''} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Estado</label>
                    <select className={s.select} name="estado" defaultValue={selectedAsesor?.estado}>
                      {ESTADOS_GENERALES.map(es => (
                        <option key={es} value={es}>{es}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={() => { setModalOpen(false); setSelectedAsesor(null); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitAsesor}>
                    {selectedAsesor ? 'Guardar cambios' : 'Crear asesor'}
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
            await authApi.deleteUser(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success('Asesor eliminado');
          } catch {
            toast.error('No se pudo eliminar el asesor');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar asesor"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};

