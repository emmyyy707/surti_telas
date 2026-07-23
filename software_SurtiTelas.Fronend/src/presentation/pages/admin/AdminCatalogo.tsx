import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import s from './AdminCatalogo.module.css';
import { DataTable, DataTableColumn, DataTableAction } from '@/shared/ui/DataTable';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { AddTagInput } from '@/presentation/components/AddTagInput';
import { ProductPreviewModal } from '@/presentation/components/ProductPreviewModal';
import { ProductDetailModal } from '@/presentation/components/ProductDetailModal';
import { useProductos, useAppStore } from '@/core/stores';
import { useAuth } from '@/core/stores/authStore';
import { productService } from '@/services/productService';
import type { Producto, PublicationStatus } from '@/core/types';
import { MARCA_DEFECTO, ETIQUETAS_PRODUCTO } from '@/shared/constants/options';

const publishStatus = (p: Producto): PublicationStatus => {
  if (!p.publicado) return p.estado === 'Inactivo' ? 'Oculto' : 'Borrador';
  return 'Publicado';
};

export const AdminCatalogo: React.FC = () => {
  const isAdmin = useAuth().user?.role === 'admin';
  const canPublish = isAdmin;
  const canUnpublish = isAdmin;
  const { productos, deleteProducto } = useProductos();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Producto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Producto | null>(null);
  const [detailProduct, setDetailProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publishingRef = React.useRef<Record<string, boolean>>({} as Record<string, boolean>);
  const [, setTick] = useState(0);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingRef, setEditingRef] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descripcionCorta, setDescripcionCorta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioAnterior, setPrecioAnterior] = useState('');
  const [descuento, setDescuento] = useState('');
  const [cantidadStock, setCantidadStock] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [colores, setColores] = useState<string[]>([]);
  const [tallas, setTallas] = useState<string[]>([]);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [oferta, setOferta] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [masVendido, setMasVendido] = useState(false);
  const [tela, setTela] = useState('');

  const filtered = useMemo(() => {
    return productos.filter(p =>
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [productos, search]);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setDescripcionCorta('');
    setCategoria('');
    setSubcategoria('');
    setMarca('');
    setPrecio('');
    setPrecioAnterior('');
    setDescuento('');
    setCantidadStock('');
    setEstado('Activo');
    setColores([]);
    setTallas([]);
    setImagenes([]);
    setImagenPrincipal('');
    setDestacado(false);
    setOferta(false);
    setNuevo(false);
    setMasVendido(false);
    setTela('');
    setEditingRef(null);
    setFormError(null);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  const openEdit = (product: Producto) => {
    setEditingRef(product.ref);
    setNombre(product.nombre);
    setDescripcion(product.descripcion || '');
    setDescripcionCorta(product.descripcionCorta || product.descripcion || '');
    setCategoria(product.categoria || '');
    setSubcategoria(product.subcategoria || '');
    setMarca(product.marca || '');
    setPrecio(String(product.precio));
    setPrecioAnterior(product.precioAnterior ? String(product.precioAnterior) : '');
    setDescuento(product.descuento ? String(product.descuento) : '');
    setCantidadStock(String(product.cantidadStock));
    setEstado(product.estado || 'Activo');
    setColores(product.colores || []);
    setTallas(product.tallas || []);
    setImagenes(product.imagenes || []);
    setImagenPrincipal(product.imagenPrincipal || '');
    setDestacado(product.destacado || false);
    setOferta(product.oferta || false);
    setNuevo(product.nuevo || false);
    setMasVendido(product.masVendido || false);
    setTela(product.tela || '');
    setFormError(null);
    setIsEditOpen(true);
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!nombre.trim()) { setFormError('El nombre del producto es obligatorio'); return false; }
    if (!categoria.trim()) { setFormError('La categoría es obligatoria'); return false; }
    if (!precio || Number(precio) <= 0) { setFormError('El precio debe ser mayor a 0'); return false; }
    if (!imagenPrincipal && (!imagenes || imagenes.length === 0)) {
      setFormError('Debes añadir al menos 1 imagen para el producto.');
      return false;
    }
    if (imagenes.length > 4) { setFormError('El producto permite un máximo de 4 imágenes.'); return false; }
    if (cantidadStock !== '' && Number(cantidadStock) < 0) { setFormError('La cantidad en stock no puede ser negativa'); return false; }
    if (!colores || colores.length === 0) { setFormError('Debes añadir al menos 1 color.'); return false; }
    if (!tallas || tallas.length === 0) { setFormError('Debes añadir al menos 1 talla.'); return false; }
    return true;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const totalQty = Number(cantidadStock) || 0;
      const pre = precioAnterior ? Number(precioAnterior) : Number(precio);
      const desc = descuento ? Number(descuento) : 0;
      const baseData: Omit<Producto, 'ref'> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || descripcionCorta.trim(),
        descripcionCorta: descripcionCorta.trim() || descripcion.trim() || nombre.trim(),
        categoria: categoria.trim(),
        subcategoria: subcategoria.trim(),
        marca: marca.trim(),
        precio: Number(precio),
        precioAnterior: pre,
        descuento: desc,
        stock: totalQty === 0 ? 'Agotado' : totalQty <= 10 ? 'Bajo stock' : 'OK' as 'OK' | 'Bajo stock' | 'Agotado',
        cantidadStock: totalQty,
        estado,
        imagenes: imagenes.filter(Boolean),
        imagenPrincipal: imagenPrincipal || (imagenes.length > 0 ? imagenes[0] : ''),
        destacado,
        oferta,
        nuevo,
        masVendido,
        tela,
        colores,
        tallas,
      };

      if (editingRef) {
        const refreshed = await useAppStore.getState().updateProducto(editingRef, baseData);
        toast.success(`${refreshed.nombre} actualizado correctamente`);
      } else {
        const nuevoCodigo = `PROD-${String(useAppStore.getState().productos.length + 1).padStart(3, '0')}`;
        const creado = await useAppStore.getState().createProducto({
          ...baseData,
          codigo: nuevoCodigo,
        });
        toast.success(`${creado.nombre} creado correctamente`);
      }

      resetForm();
} catch (err: unknown) {
       toast.error((err as { message?: string })?.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (product: Producto) => {
    if (!canPublish) return;
    try {
      publishingRef.current[product.ref] = true;
      setTick(t => t + 1);
      const resp = await productService.publish(product.ref) as { success: boolean; data?: Producto; error?: string };
      if (resp?.success && resp?.data) {
        useAppStore.getState().updateProducto(product.ref, resp.data);
        toast.success(`"${resp.data.nombre}" publicado correctamente`);
      } else {
        toast.error(resp?.error || 'Error al publicar');
      }
    } catch {
      toast.error('Error de conexión al publicar');
    } finally {
      delete publishingRef.current[product.ref];
      setTick(t => t + 1);
    }
  };

  const handleUnpublish = async (product: Producto) => {
    if (!canUnpublish) return;
    try {
      const resp = await productService.unpublish(product.ref) as { success: boolean; data?: Producto; error?: string };
      if (resp?.success && resp?.data) {
        useAppStore.getState().updateProducto(product.ref, resp.data);
        toast.success(`"${resp.data.nombre}" ya no está visible en el catálogo`);
      } else {
        toast.error(resp?.error || 'Error al ocultar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleOpenPreview = (product: Producto) => {
    setPreviewProduct(product);
    setPreviewOpen(true);
  };

  const handleOpenDetail = (product: Producto) => {
    setDetailProduct(product);
    setIsModalOpen(true);
  };

  const columns: DataTableColumn<Producto>[] = [
    {
      key: 'nombre',
      header: 'Producto',
      sortable: true,
      minWidth: '220px',
      render: (item: Producto) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
            {item.nombre}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {item.codigo || item.ref}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      sortable: true,
      render: (item: Producto) => (
        <div>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>{item.categoria || 'General'}</div>
          {item.subcategoria && (
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.subcategoria}</div>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (item: Producto) => {
        const variant = item.stock === 'OK' ? 'success' : item.stock === 'Bajo stock' ? 'warning' : 'danger';
        return <Badge variant={variant}>{item.stock}</Badge>;
      },
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      align: 'right',
      render: (item: Producto) => <span style={{ fontSize: '0.84rem' }}>{item.cantidadStock}</span>,
    },
    {
      key: 'precio',
      header: 'Precio',
      sortable: true,
      align: 'right',
      render: (item: Producto) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: '0.88rem' }}>
            ${item.precio.toLocaleString()}
          </span>
          {item.precioAnterior && item.precioAnterior > item.precio && (
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
              ${item.precioAnterior.toLocaleString()}
              {(item.descuento ?? 0) > 0 && <span style={{ color: '#ef4444', marginLeft: '4px' }}>-{item.descuento}%</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'publicacion',
      header: 'Publicación',
      sortable: true,
      align: 'center',
      render: (item: Producto) => {
        const status = publishStatus(item);
        const config: { [K in PublicationStatus]: { variant: 'success' | 'warning' | 'danger' } } = {
          Publicado: { variant: 'success' },
          Borrador: { variant: 'warning' },
          Oculto: { variant: 'danger' },
        };
        const cfg = config[status];
        return <Badge variant={cfg.variant} dot>{status}</Badge>;
      },
    },
  ];

  const actions: DataTableAction<Producto>[] = [
    {
      label: 'Ver más',
      icon: <Eye size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Producto) => handleOpenDetail(item),
    },
    {
      label: 'Vista previa',
      icon: <Eye size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Producto) => handleOpenPreview(item),
    },
    {
      label: 'Editar',
      icon: <Edit size={14} aria-hidden="true" focusable="false" />,
      onClick: (item: Producto) => openEdit(item),
    },
    ...(canPublish ? [
      {
        label: 'Publicar',
        icon: <Eye size={14} aria-hidden="true" focusable="false" />,
        onClick: (item: Producto) => handlePublish(item),
        disabled: (item: Producto) => (item.publicado === true) || (publishingRef.current[item.ref] === true),
      },
    ] : []),
    ...(canUnpublish ? [
      {
        label: 'Ocultar',
        icon: <EyeOff size={14} aria-hidden="true" focusable="false" />,
        onClick: (item: Producto) => handleUnpublish(item),
        disabled: (item: Producto) => item.publicado !== true,
      },
    ] : []),
    {
      label: 'Eliminar',
      icon: <Trash2 size={14} aria-hidden="true" focusable="false" />,
      danger: true,
      onClick: (item: Producto) => setDeleteConfirm(item),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className={s.pageTitle}>Catálogo Digital</h1>
          <p className={s.pageSubtitle}>Gestiona productos para el catálogo digital del frontend</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
          Nuevo Producto
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar por nombre, código o categoría..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <DataTable<Producto>
        data={filtered}
        columns={columns}
        actions={actions}
        enableExport={false}
        enableRowSelection={false}
        enableSorting={true}
        enableColumnFilters={false}
        toolbarLeft={null}
        maxVisibleColumns={6}
      />

      <Modal open={isCreateOpen || isEditOpen} onClose={resetForm} title={editingRef ? 'Editar Producto' : 'Registrar Nuevo Producto'} size="lg">
        <form onSubmit={handleSaveProduct} className={s.modalForm}>
          {formError && !saving && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 500 }}>
              {formError}
            </div>
          )}

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Nombre del Producto *</label>
              <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Camiseta Oversize Premium" />
            </div>
            <div className={s.formGroup}>
              <label>Categoría *</label>
              <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ej: Camisetas" />
            </div>
          </div>

          <div className={s.formGroup}>
            <label>Descripción Corta</label>
            <input type="text" value={descripcionCorta} onChange={e => setDescripcionCorta(e.target.value)} placeholder="Resumen breve para el catálogo" />
          </div>

          <div className={s.formGroup}>
            <label>Descripción Completa</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Añade detalles sobre el producto..." rows={3} />
          </div>

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Precio ($) *</label>
              <input type="number" required min="1" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio base" />
            </div>
            <div className={s.formGroup}>
              <label>Precio Anterior (opcional)</label>
              <input type="number" min="0" value={precioAnterior} onChange={e => setPrecioAnterior(e.target.value)} placeholder="Sin descuento" />
            </div>
          </div>

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Descuento (%)</label>
              <input type="number" min="0" max="100" value={descuento} onChange={e => setDescuento(e.target.value)} placeholder="0" />
            </div>
            <div className={s.formGroup}>
              <label>Cantidad Stock</label>
              <input type="number" required min="0" value={cantidadStock} onChange={e => setCantidadStock(e.target.value)} placeholder="Unidades en bodega" />
            </div>
          </div>

          <div className={s.formRow}>
              <div className={s.formGroup}>
                <label>Tipo de Tela</label>
                <input type="text" value={tela} onChange={(e) => setTela(e.target.value)} placeholder="Ej: Algodón, Poliéster" />
              </div>
            <div className={s.formGroup}>
              <label>Marca</label>
              <input type="text" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Marca" />
            </div>
          </div>

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Colores Disponibles</label>
              <AddTagInput tags={colores} onTagsChange={setColores} placeholder="Ej: Azul, Blanco, Verde" />
            </div>
            <div className={s.formGroup}>
              <label>Tallas Disponibles</label>
              <AddTagInput tags={tallas} onTagsChange={setTallas} placeholder="Ej: S, M, L, XL" />
            </div>
          </div>

          <div className={s.formGroup}>
            <label>Subcategoría</label>
            <input type="text" value={subcategoria} onChange={e => setSubcategoria(e.target.value)} placeholder="Ej: Básicas, Premium" />
          </div>

          <div className={s.formGroup}>
            <label>Imagen Principal (URL)</label>
            <input type="text" value={imagenPrincipal} onChange={e => setImagenPrincipal(e.target.value)} placeholder="https://..." />
          </div>

          <div className={s.formGroup}>
            <label>Imágenes de Referencia (URLs adicionales, máx 4)</label>
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

          <div className={s.formGroup}>
            <label>Estado</label>
            <select value={estado} onChange={e => setEstado(e.target.value as 'Activo' | 'Inactivo')}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo (Oculto)</option>
            </select>
          </div>

          <div className={s.formGroup}>
            <label>Etiquetas</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ETIQUETAS_PRODUCTO.map(({ key, label }) => {
                const state = key === 'destacado' ? destacado : key === 'oferta' ? oferta : key === 'nuevo' ? nuevo : masVendido;
                const set = key === 'destacado' ? setDestacado : key === 'oferta' ? setOferta : key === 'nuevo' ? setNuevo : setMasVendido;
                return (
                <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-secondary)', padding: '6px 12px', background: state ? 'rgba(244,162,97,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: '8px', border: `1px solid ${state ? 'rgba(244,162,97,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                  <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} />
                  {label}
                </label>
                );
              })}
            </div>
          </div>

          <div className={s.modalActions}>
            <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>{editingRef ? 'Guardar Cambios' : 'Crear Producto (Borrador)'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await deleteProducto(deleteConfirm.ref);
            toast.success(`"${deleteConfirm.nombre}" eliminado del catálogo`);
          }
          setDeleteConfirm(null);
        }}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <ProductPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} product={previewProduct} />

      {detailProduct && (
        <ProductDetailModal
          product={{
            id: detailProduct.ref,
            nombre: detailProduct.nombre,
            precio: detailProduct.precio,
            imagen: detailProduct.imagenPrincipal || detailProduct.imagenes?.[0],
            categoria: detailProduct.categoria,
            descripcion: detailProduct.descripcion || detailProduct.descripcionCorta,
            tallas: detailProduct.tallas,
            colores: detailProduct.colores,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
