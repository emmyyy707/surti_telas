import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ToggleLeft, Barcode, Package, CreditCard, Calendar, User, Save, Loader2, AlertCircle } from 'lucide-react';
import s from './ProductosTerminados.module.css';
import f from '@/styles/Form.module.css';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { productsApi, type ProductTerminado } from '@/infrastructure/api/productsApi';
import { CATEGORIAS_PRODUCTO, TALLAS_PRODUCTO } from '@/shared/constants/options';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  talla: string;
  color: string;
  stock: number;
  precio: number;
  precioAnterior: number;
  descuento: number;
  tela: string;
  imagenes: string[];
  imagenPrincipal: string;
  destacado: boolean;
  oferta: boolean;
  nuevo: boolean;
  masVendido: boolean;
  fechaCreacion: string;
  estado: 'Activo' | 'Inactivo';
}

const categorias: string[] = [...CATEGORIAS_PRODUCTO];
const tallas: string[] = [...TALLAS_PRODUCTO];

export const AdminProductosTerminados: React.FC = () => {
  const [search, setSearch] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Producto | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.list();
        if (!active) return;
        setProductos(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos terminados');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descripcionCorta, setDescripcionCorta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioAnterior, setPrecioAnterior] = useState('');
  const [descuento, setDescuento] = useState('');
  const [tela, setTela] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [oferta, setOferta] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [masVendido, setMasVendido] = useState(false);
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProductos = useMemo(() => {
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
    );
  }, [productos, search]);

  const resetForm = () => {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setDescripcionCorta('');
    setCategoria('');
    setSubcategoria('');
    setMarca('');
    setTalla('');
    setColor('');
    setStock('');
    setPrecio('');
    setPrecioAnterior('');
    setDescuento('');
    setTela('');
    setImagenes([]);
    setImagenPrincipal('');
    setDestacado(false);
    setOferta(false);
    setNuevo(false);
    setMasVendido(false);
    setEstado('Activo');
    setFormError(null);
  };

  const openModal = (item?: Producto) => {
    if (item) {
      setCodigo(item.codigo);
      setNombre(item.nombre);
      setDescripcion(item.descripcion);
      setDescripcionCorta(item.descripcionCorta);
      setCategoria(item.categoria);
      setSubcategoria(item.subcategoria);
      setMarca(item.marca);
      setTalla(item.talla);
      setColor(item.color);
      setStock(String(item.stock));
      setPrecio(String(item.precio));
      setPrecioAnterior(String(item.precioAnterior));
      setDescuento(String(item.descuento));
      setTela(item.tela);
      setImagenes(item.imagenes);
      setImagenPrincipal(item.imagenPrincipal);
      setDestacado(item.destacado);
      setOferta(item.oferta);
      setNuevo(item.nuevo);
      setMasVendido(item.masVendido);
      setEstado(item.estado);
      setEditingId(item.id);
    } else {
      resetForm();
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setFormError(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!nombre.trim()) { setFormError('El nombre del producto es obligatorio'); return; }
    if (!codigo.trim()) { setFormError('El código del producto es obligatorio'); return; }
    if (!precio || Number(precio) <= 0) { setFormError('El precio debe ser mayor a 0'); return; }
    setSaving(true);
    try {
      const data: Partial<ProductTerminado> = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || descripcionCorta.trim() || nombre.trim(),
        descripcionCorta: descripcionCorta.trim() || descripcion.trim() || nombre.trim(),
        categoria,
        subcategoria,
        marca: marca.trim(),
        talla,
        color: color.trim() || '',
        stock: Number(stock) || 0,
        precio: Number(precio),
        precioAnterior: precioAnterior ? Number(precioAnterior) : undefined,
        descuento: descuento ? Number(descuento) : undefined,
        tela: tela.trim() || undefined,
        imagenes: imagenes.filter(Boolean),
        imagenPrincipal: imagenPrincipal || (imagenes.length > 0 ? imagenes[0] : ''),
        destacado,
        oferta,
        nuevo,
        masVendido,
        estado,
      };
      if (editingId) {
        await productsApi.update(editingId, data);
        setProductos(prev => prev.map(p => p.id === editingId ? { ...p, ...data } : p));
        toast.success(`Producto "${nombre.trim()}" actualizado correctamente`);
      } else {
        if (productos.some(p => p.codigo.toLowerCase() === codigo.trim().toLowerCase())) {
          setFormError('Ya existe un producto con ese código');
          setSaving(false);
          return;
        }
        const creado = await productsApi.create(data);
        setProductos(prev => [creado, ...prev]);
        toast.success(`Producto "${creado.nombre}" creado correctamente`);
      }
      closeModal();
    } catch {
      toast.error('No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<Producto>[] = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true,
      render: (item) => (
        <div className={s.codigoCell}>
          <Barcode size={14} />
          {item.codigo}
        </div>
      ),
    },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'categoria', header: 'Categoría', sortable: true },
    { key: 'stock', header: 'Stock', sortable: true, align: 'right' },
    { key: 'precio', header: 'Precio', sortable: true, align: 'right' },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Producto> = {
    title: item => `Detalle: ${item.nombre}`,
    size: 'xl',
    header: item => ({
      icon: <Package size={18} />,
      title: 'Producto terminado',
      code: item.codigo,
      subtitle: `${item.nombre} · ${item.categoria}`,
      meta: item.fechaCreacion,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : 'default',
    }),
    kpis: item => [
      { label: 'Stock', value: item.stock, icon: <Package size={16} />, tone: item.stock > 0 ? 'success' : 'danger' },
      { label: 'Precio', value: `$${item.precio.toLocaleString()}`, icon: <CreditCard size={16} />, tone: 'info' },
      { label: 'Talla', value: item.talla, icon: <User size={16} />, tone: 'primary' },
      { label: 'Creación', value: item.fechaCreacion, icon: <Calendar size={16} />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Talla:</span> {item.talla}</div>
        <div className={s.detailRow}><span>Color:</span> {item.color}</div>
        <div className={s.detailRow}><span>Precio:</span> ${item.precio.toLocaleString()}</div>
        <div className={s.detailRow}><span>Fecha creación:</span> {item.fechaCreacion}</div>
      </div>
    ),
  };

  const actions: DataTableAction<Producto>[] = [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (item) => openModal(item) },
    { label: 'Desactivar', icon: <ToggleLeft size={14} />, onClick: async (item) => {
      const nuevoEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
      await productsApi.update(item.id, { estado: nuevoEstado });
      setProductos(prev => prev.map(p => p.id === item.id ? { ...p, estado: nuevoEstado } : p));
      toast.info(`Producto "${item.nombre}" ${nuevoEstado === 'Inactivo' ? 'desactivado' : 'activado'}`);
    } },
    { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (item) => setDeleteConfirm(item) },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Productos Terminados</h1>
          <p className={s.pageSubtitle}>Control de productos finalizados</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => openModal()}>
          Nuevo Producto
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.stateBox}>
            <Loader2 size={28} className={s.spin} />
            <p>Cargando productos terminados...</p>
          </div>
        )}
        {error && (
          <div className={s.errorBox}>
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
        <DataTable
          data={filteredProductos}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          toolbarLeft={null}
          maxVisibleColumns={5}
          emptyMessage="Sin resultados"
        />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Registrar Nuevo Producto"
        description="Completa la información del producto terminado"
        size="lg"
        variant="form"
      >
        <form onSubmit={handleSubmit} className={f.form}>
          {formError && <div className={f.formError}>{formError}</div>}

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Código *</label>
              <input className={f.input} value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej: PROD-006" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Nombre *</label>
              <input className={f.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Camisa Polo M" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Categoría *</label>
              <select className={f.select} value={categoria} onChange={e => setCategoria(e.target.value)}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Talla *</label>
              <select className={f.select} value={talla} onChange={e => setTalla(e.target.value)}>
                {tallas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className={f.formGroup}>
            <label className={f.label}>Descripción Corta</label>
            <input className={f.input} value={descripcionCorta} onChange={e => setDescripcionCorta(e.target.value)} placeholder="Resumen breve del producto" />
          </div>

          <div className={f.formGroup}>
            <label className={f.label}>Descripción Completa</label>
            <textarea className={f.textarea} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Añade detalles sobre el producto..." rows={3} />
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Precio ($) *</label>
              <input className={f.input} type="number" min="1" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio base" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Precio Anterior (opcional)</label>
              <input className={f.input} type="number" min="0" value={precioAnterior} onChange={e => setPrecioAnterior(e.target.value)} placeholder="Sin descuento" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Descuento (%)</label>
              <input className={f.input} type="number" min="0" max="100" value={descuento} onChange={e => setDescuento(e.target.value)} placeholder="0" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Stock (unidades) *</label>
              <input className={f.input} type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="Unidades en bodega" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Tipo de Tela</label>
              <input className={f.input} value={tela} onChange={e => setTela(e.target.value)} placeholder="Ej: Algodón, Poliéster" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Marca</label>
              <input className={f.input} value={marca} onChange={e => setMarca(e.target.value)} placeholder="Marca" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Color</label>
              <input className={f.input} value={color} onChange={e => setColor(e.target.value)} placeholder="Ej: Azul" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Estado *</label>
              <select className={f.select} value={estado} onChange={e => setEstado(e.target.value as 'Activo' | 'Inactivo')}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo (Oculto)</option>
              </select>
            </div>
          </div>

          <div className={f.formGroup}>
            <label className={f.label}>Imagen Principal (URL)</label>
            <input className={f.input} type="text" value={imagenPrincipal} onChange={e => setImagenPrincipal(e.target.value)} placeholder="https://..." />
          </div>

          <div className={f.formGroup}>
            <label className={f.label}>Imágenes de Referencia (URLs adicionales, máx 4)</label>
            <div className={s.uploadContainer}>
              <label className={s.uploadPlaceholder}>
                <span style={{ fontSize: '1.2rem' }}>+</span>
                <span>Agregar imagen (URL)</span>
                <input
                  type="text"
                  className={s.hiddenFileInput}
                  placeholder="Pegar URL y presionar Enter"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim() && imagenes.length < 4) {
                      e.preventDefault();
                      setImagenes([...imagenes, e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </label>
              {imagenes.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {imagenes.map((url, index) => (
                    <div key={index} className={s.previewBox} style={{ width: '100px' }}>
                      <img src={url} alt={`Ref ${index + 1}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px' }} />
                      <button type="button" onClick={() => setImagenes(imagenes.filter((_, i) => i !== index))} className={s.removeImgBtn}>
                        <span style={{ fontSize: '14px' }}>×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={f.formGroup}>
            <label className={f.label}>Etiquetas</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { key: 'destacado', label: 'Destacado', value: destacado, set: setDestacado },
                { key: 'oferta', label: 'Oferta', value: oferta, set: setOferta },
                { key: 'nuevo', label: 'Nuevo', value: nuevo, set: setNuevo },
                { key: 'masVendido', label: 'Más vendido', value: masVendido, set: setMasVendido },
              ].map(({ key, label, value, set }) => (
                <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-secondary)', padding: '6px 12px', background: value ? 'rgba(244,162,97,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: '8px', border: `1px solid ${value ? 'rgba(244,162,97,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                  <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className={f.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
              {editingId ? 'Guardar Cambios' : 'Crear Producto'}
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
            await productsApi.remove(deleteConfirm.id);
            setProductos(prev => prev.filter(p => p.id !== deleteConfirm.id));
            toast.success(`Producto "${deleteConfirm.nombre}" eliminado`);
          } catch {
            toast.error('No se pudo eliminar el producto');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
