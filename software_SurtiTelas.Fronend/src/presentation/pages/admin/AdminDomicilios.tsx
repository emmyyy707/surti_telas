import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, UserPlus, Package, CheckCircle2, Clock, XCircle, User } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import s from './AdminDomicilios.module.css';
import f from '@/styles/Form.module.css';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '../../../shared/ui/DataTable';
import { usersApi, type Usuario } from '../../../infrastructure/api/usersApi';

export const AdminDomicilios: React.FC = () => {
  const [search, setSearch] = useState('');
  const [domiciliarios, setDomiciliarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDomiciliarios() {
      try {
        setLoading(true);
        setError(null);
        const data = await usersApi.list({ role: 'DOMICILIARIO' });
        if (!cancelled) {
          setDomiciliarios(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar domiciliarios');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDomiciliarios();
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormNombre('');
    setFormEmail('');
    setFormPassword('');
    setFormTelefono('');
    setCreateOpen(true);
  };

  const openEdit = (item: Usuario) => {
    setEditingId(item.id);
    setFormNombre(item.nombre);
    setFormEmail(item.email);
    setFormPassword('');
    setFormTelefono('');
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim() || !formPassword) return;
    setSaving(true);
    try {
      const created = await usersApi.create({
        nombre: formNombre.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: 'DOMICILIARIO',
        telefono: formTelefono.trim() || undefined,
      });
      setDomiciliarios(prev => [...prev, created]);
      toast.success('Domiciliario creado');
      setCreateOpen(false);
      setFormNombre('');
      setFormEmail('');
      setFormPassword('');
      setFormTelefono('');
    } catch {
      toast.error('No se pudo crear el domiciliario');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formNombre.trim()) return;
    setSaving(true);
    try {
      const updated = await usersApi.update(editingId, {
        nombre: formNombre.trim(),
        telefono: formTelefono.trim() || undefined,
      });
      setDomiciliarios(prev => prev.map(d => d.id === editingId ? { ...d, ...updated } : d));
      toast.success('Domiciliario actualizado');
      setEditOpen(false);
      setEditingId(null);
    } catch {
      toast.error('No se pudo actualizar el domiciliario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await usersApi.remove(deleteId);
      setDomiciliarios(prev => prev.filter(d => d.id !== deleteId));
      toast.success('Domiciliario eliminado');
      setDeleteId(null);
    } catch {
      toast.error('No se pudo eliminar el domiciliario');
    } finally {
      setSaving(false);
    }
  };

  const filteredDomiciliarios = domiciliarios.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: domiciliarios.length,
    activos: domiciliarios.filter(d => d.estado === 'Activo').length,
    inactivos: domiciliarios.filter(d => d.estado === 'Inactivo').length,
    pendientes: domiciliarios.filter(d => d.estado === 'Pendiente').length,
  };

  const columns: DataTableColumn<Usuario>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Usuario> = {
    title: item => `Detalle: ${item.nombre}`,
    size: 'lg',
    header: item => ({
      icon: <User size={18} />,
      title: 'Domiciliario',
      code: item.id,
      subtitle: item.email,
      meta: item.rol,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : item.estado === 'Pendiente' ? 'warning' : 'default',
    }),
    kpis: item => [
      { label: 'Rol', value: item.rol, icon: <Package size={16} />, tone: 'primary' as const },
      { label: 'Registro', value: item.fechaRegistro, icon: <Clock size={16} />, tone: 'info' as const },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Email:</span> {item.email || '—'}</div>
        <div className={s.detailRow}><span>Rol:</span> {item.rol}</div>
        <div className={s.detailRow}><span>Estado:</span> {item.estado}</div>
        <div className={s.detailRow}><span>Fecha registro:</span> {item.fechaRegistro}</div>
      </div>
    ),
  };

  const actions: DataTableAction<Usuario>[] = [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (item) => openEdit(item) },
    { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: (item) => setDeleteId(item.id) },
  ];

  if (loading) {
    return (
      <div>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Domiciliarios</h1>
            <p className={s.pageSubtitle}>Gestión del equipo de entregas</p>
          </div>
        </div>
        <div className={s.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={s.statCard}>
              <div className={s.statIcon} style={{ opacity: 0.3 }}><Package size={20} /></div>
              <div className={s.statValue} style={{ opacity: 0.3 }}>—</div>
              <div className={s.statLabel} style={{ opacity: 0.3 }}>Cargando...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Domiciliarios</h1>
            <p className={s.pageSubtitle}>Gestión del equipo de entregas</p>
          </div>
        </div>
        <div className={s.statCard} style={{ textAlign: 'center', color: 'var(--color-danger)' }}>
          <p>{error}</p>
          <button
            className={s.actionBtn}
            style={{ marginTop: 12 }}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Domiciliarios</h1>
          <p className={s.pageSubtitle}>Gestión del equipo de entregas</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <UserPlus size={16} />
          Nuevo domiciliario
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar domiciliarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={s.statIcon}><Package size={20} /></div>
          <div className={s.statValue}>{stats.total}</div>
          <div className={s.statLabel}>Total</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIcon}><CheckCircle2 size={20} /></div>
          <div className={s.statValue}>{stats.activos}</div>
          <div className={s.statLabel}>Activos</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIcon}><Clock size={20} /></div>
          <div className={s.statValue}>{stats.inactivos}</div>
          <div className={s.statLabel}>Inactivos</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIcon}><XCircle size={20} /></div>
          <div className={s.statValue}>{stats.pendientes}</div>
          <div className={s.statLabel}>Pendientes</div>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filteredDomiciliarios}
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

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo domiciliario"
        description="Crea un nuevo usuario domiciliario."
        size="lg"
        variant="form"
      >
        <form id="createDomiciliarioForm" className={f.form} onSubmit={handleCreate}>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Nombre completo</label>
              <input type="text" className={f.input} value={formNombre} onChange={e => setFormNombre(e.target.value)} placeholder="Ej: Juan Pérez" required />
            </div>
            <div className={f.field}>
              <label className={f.label}>Correo electrónico</label>
              <input type="email" className={f.input} value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Ej: juan@example.com" required />
            </div>
          </div>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Contraseña</label>
              <input type="password" className={f.input} value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
            </div>
            <div className={f.field}>
              <label className={f.label}>Teléfono</label>
              <input type="tel" className={f.input} value={formTelefono} onChange={e => setFormTelefono(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div className={f.formActions}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear domiciliario'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingId(null); }}
        title="Editar domiciliario"
        description="Modifica los datos del domiciliario."
        size="lg"
        variant="form"
      >
        <form id="editDomiciliarioForm" className={f.form} onSubmit={handleUpdate}>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Nombre completo</label>
              <input type="text" className={f.input} value={formNombre} onChange={e => setFormNombre(e.target.value)} required />
            </div>
            <div className={f.field}>
              <label className={f.label}>Correo electrónico</label>
              <input type="email" className={f.input} value={formEmail} disabled />
            </div>
          </div>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Teléfono</label>
              <input type="tel" className={f.input} value={formTelefono} onChange={e => setFormTelefono(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div className={f.formActions}>
            <Button variant="secondary" type="button" onClick={() => { setEditOpen(false); setEditingId(null); }} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar domiciliario"
        description="Esta acción no se puede deshacer. El usuario será eliminado permanentemente."
        size="sm"
      >
        <div className={f.formActions}>
          <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={saving}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</Button>
        </div>
      </Modal>
    </div>
  );
};
