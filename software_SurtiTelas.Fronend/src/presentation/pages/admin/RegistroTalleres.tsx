import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ToggleLeft } from 'lucide-react';
import s from './RegistroTalleres.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { workshopsApi, type Workshop } from '@/infrastructure/api/workshopsApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';

interface Taller {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  capacidad: number;
  ocupacion: number;
  estado: 'Activo' | 'Inactivo';
}

function toTaller(w: Workshop): Taller {
  return {
    id: w.id,
    nombre: w.nombre,
    contacto: '',
    telefono: '',
    email: '',
    direccion: w.direccion ?? '',
    ciudad: w.ciudad ?? '',
    capacidad: w.capacidad ?? 0,
    ocupacion: 0,
    estado: w.estado,
  };
}

export const AdminRegistroTalleres: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<Taller | null>(null);
  const [items, setItems] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Taller | null>( null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchTalleres = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await workshopsApi.list();
        setItems(data.map(toTaller));
      } catch {
        setError('No se pudieron cargar los talleres');
      } finally {
        setLoading(false);
      }
    };
    void fetchTalleres();
  }, []);

  const filteredTalleres = items.filter(t =>
    t.nombre.toLowerCase().includes(search.toLowerCase()) ||
    String(t.contacto ?? '').toLowerCase().includes(search.toLowerCase()) ||
    t.ciudad.toLowerCase().includes(search.toLowerCase())
  );

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTaller(null);
  };

  const handleSubmitTaller = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const _contacto = String(fd.get('contacto') ?? '').trim();
    const _telefono = String(fd.get('telefono') ?? '').trim();
    const _email = String(fd.get('email') ?? '').trim();
    const direccion = String(fd.get('direccion') ?? '').trim();
    const ciudad = String(fd.get('ciudad') ?? '').trim();
    const capacidad = Number(fd.get('capacidad') ?? 0) || 0;
    try {
      if (selectedTaller) {
        const actualizado = await workshopsApi.update(selectedTaller.id, {
          nombre,
          direccion,
          ciudad,
          capacidad,
        });
        setItems(prev => prev.map(it => it.id === selectedTaller.id ? toTaller(actualizado) : it));
        toast.success('Taller actualizado');
      } else {
        const nuevo = await workshopsApi.create({
          nombre,
          direccion,
          ciudad,
          capacidad,
        });
        setItems(prev => [toTaller(nuevo), ...prev]);
        toast.success('Taller creado');
      }
      handleCloseModal();
    } catch {
      toast.error('No fue posible guardar el taller');
    }
  };

  const _handleToggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const actualizado = await workshopsApi.update(id, { estado: nuevoEstado });
      setItems(prev => prev.map(it => it.id === id ? toTaller(actualizado) : it));
      toast.success(`Taller ${id} cambiado a estado: ${nuevoEstado}`);
    } catch {
      toast.error('No fue posible cambiar el estado del taller');
    }
  };

  const handleEliminar = (taller: Taller) => {
    setDeleteConfirm(taller);
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Registro de Talleres</h1>
          <p className={s.pageSubtitle}>Gestión de talleres externos</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Taller
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar talleres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <DataTable<Taller>
        data={filteredTalleres}
        pageSize={10}
        emptyMessage={loading ? 'Cargando talleres...' : error ? error : 'Sin resultados'}
        actions={(t) => [
          ...(t.estado === 'Activo' ? [{ label: 'Desactivar', icon: <ToggleLeft size={14} />, onClick: () => _handleToggleEstado(t.id, t.estado) }] : [{ label: 'Activar', icon: <ToggleLeft size={14} />, onClick: () => _handleToggleEstado(t.id, t.estado) }]),
          { label: 'Editar', icon: <Edit size={14} />, onClick: () => { setSelectedTaller(t); setModalOpen(true); } },
          { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: () => handleEliminar(t) },
        ]}
        columns={[
          { key: 'nombre', header: 'Taller', width: '240px', render: (t) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-text-primary)]">{t.nombre}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{t.contacto}</span>
            </div>
          )},
          { key: 'ciudad', header: 'Ubicación', width: '200px', render: (t) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-[var(--color-text-primary)]">{t.ciudad}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{t.direccion}</span>
            </div>
          )},
          { key: 'telefono', header: 'Contacto', width: '180px', render: (t) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-[var(--color-text-primary)]">{t.telefono || '—'}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{t.email || '—'}</span>
            </div>
          )},
          { key: 'ocupacion', header: 'Ocupación', width: '160px', render: (t) => (
            <div className="flex flex-col gap-1">
              <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)]">
                <div className="h-1.5 rounded-full bg-[var(--color-accent)]" style={{ width: `${t.capacidad ? (t.ocupacion / t.capacidad) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{t.ocupacion} / {t.capacidad}</span>
            </div>
          )},
          { key: 'estado', header: 'Estado', width: '100px', sortable: true, filterable: true, filterType: 'select', filterOptions: [
            { value: 'Activo', label: 'Activo' },
            { value: 'Inactivo', label: 'Inactivo' },
          ], render: (t) => (
            <Badge variant={t.estado === 'Activo' ? 'success' : 'default'}>
              {t.estado}
            </Badge>
          )},
        ]}
      />

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedTaller ? 'Editar Taller' : 'Nuevo Taller'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Nombre del Taller</label>
                    <input type="text" className={s.input} name="nombre" defaultValue={selectedTaller?.nombre} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Contacto</label>
                    <input type="text" className={s.input} name="contacto" defaultValue={selectedTaller?.contacto} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Teléfono</label>
                    <input type="tel" className={s.input} name="telefono" defaultValue={selectedTaller?.telefono} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Email</label>
                    <input type="email" className={s.input} name="email" defaultValue={selectedTaller?.email} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Dirección</label>
                    <input type="text" className={s.input} name="direccion" defaultValue={selectedTaller?.direccion} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Ciudad</label>
                    <input type="text" className={s.input} name="ciudad" defaultValue={selectedTaller?.ciudad} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Capacidad</label>
                    <input type="number" className={s.input} name="capacidad" defaultValue={selectedTaller?.capacidad} />
                  </div>
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitTaller}>
                    {selectedTaller ? 'Guardar cambios' : 'Crear taller'}
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
            await workshopsApi.remove(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success(`Taller ${deleteConfirm.id} eliminado`);
          } catch {
            toast.error('No se pudo eliminar el taller');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar taller"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
