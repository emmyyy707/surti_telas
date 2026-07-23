import React, { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ToggleLeft, AlertTriangle, Barcode, Package, BarChart3, CreditCard } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './Insumos.module.css';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { stockApi, type RawMaterial } from '@/infrastructure/api/stockApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { CATEGORIAS_INSUMO, UNIDADES_MEDIDA_INSUMO } from '@/shared/constants/options';

interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  medida: string;
  stock: number;
  stockMin: number;
  stockMax: number;
  precio: number;
  proveedor: string;
  estado: 'Activo' | 'Inactivo';
}

function toInsumo(m: RawMaterial): Insumo {
  return {
    id: m.id,
    codigo: m.id,
    nombre: m.nombre,
    categoria: m.categoria ?? '',
    medida: m.unidadMedida,
    stock: m.stockActual,
    stockMin: m.stockMinimo,
    stockMax: m.stockMinimo ?? 0,
    precio: m.precioUnitario,
    proveedor: '',
    estado: m.stockActual > 0 ? 'Activo' : 'Inactivo',
  };
}

export const AdminInsumos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [items, setItems] = useState<Insumo[]>([]);
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Insumo | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchInsumos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await stockApi.rawMaterials.list();
        setItems(data.map(toInsumo));
      } catch {
        setError('No se pudieron cargar los insumos');
      } finally {
        setLoading(false);
      }
    };
    void fetchInsumos();
  }, []);

  useEffect(() => {
    let active = true;
    const fetchProveedores = async () => {
      try {
        const result = await stockApi.suppliers.list();
        if (!active) return;
        setProveedores(result.data.map(p => p.nombre));
      } catch {
        if (active) setProveedores([]);
      }
    };
    void fetchProveedores();
    return () => { active = false; };
  }, []);

  const filteredInsumos = useMemo(() => {
    return items.filter(i =>
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      i.codigo.toLowerCase().includes(search.toLowerCase()) ||
      i.categoria.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInsumo(null);
  };

  const handleSubmitInsumo = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const _codigo = String(fd.get('codigo') ?? '').trim();
    const nombre = String(fd.get('nombre') ?? '').trim();
    const categoria = String(fd.get('categoria') ?? '').trim();
    const medida = String(fd.get('medida') ?? '').trim();
    const stockMin = Number(fd.get('stockMin') ?? 0) || 0;
    const _stockMax = Number(fd.get('stockMax') ?? 0) || 0;
    const precio = Number(fd.get('precio') ?? 0) || 0;
    const _proveedor = String(fd.get('proveedor') ?? '').trim();
    try {
      if (selectedInsumo) {
        const actualizado = await stockApi.rawMaterials.update(selectedInsumo.id, {
          nombre,
          categoria,
          unidadMedida: medida,
          stockActual: stockMin,
          stockMinimo: stockMin,
          precioUnitario: precio,
        });
        setItems(prev => prev.map(it => it.id === selectedInsumo.id ? toInsumo(actualizado) : it));
        toast.success('Insumo actualizado');
      } else {
        const nuevo = await stockApi.rawMaterials.create({
          nombre,
          categoria,
          unidadMedida: medida,
          stockActual: stockMin,
          stockMinimo: stockMin,
          precioUnitario: precio,
        });
        setItems(prev => [toInsumo(nuevo), ...prev]);
        toast.success('Insumo creado');
      }
      handleCloseModal();
    } catch {
      toast.error('No fue posible guardar el insumo');
    }
  };

  const handleToggleEstado = async (item: Insumo) => {
    const nuevoEstado: Insumo['estado'] = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const stockActual = nuevoEstado === 'Activo' ? Math.max(item.stock, item.stockMin || 1) : 0;
    try {
      const actualizado = await stockApi.rawMaterials.update(item.id, { stockActual });
      setItems(prev => prev.map(it => it.id === item.id ? toInsumo(actualizado) : it));
      toast.success(`Insumo ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}`);
    } catch {
      toast.error('No fue posible cambiar el estado del insumo');
    }
  };

  const handleEliminar = async (item: Insumo) => {
    setDeleteConfirm(item);
  };

  const columns: DataTableColumn<Insumo>[] = [
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
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className={s.stockCell}>
          <span>{item.stock}</span>
          {item.stock < item.stockMin && (
            <AlertTriangle size={14} className={s.stockAlert} />
          )}
        </div>
      ),
    },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<Insumo> = {
    title: item => `Detalle: ${item.nombre}`,
    size: 'xl',
    header: item => ({
      icon: <Package size={18} />,
      title: 'Insumo',
      code: item.codigo,
      subtitle: `${item.nombre} · ${item.categoria}`,
      meta: item.medida,
      status: item.estado,
      badgeVariant: item.estado === 'Activo' ? 'success' : 'default',
    }),
    kpis: item => [
      { label: 'Stock', value: item.stock, icon: <Package size={16} />, tone: item.stock < item.stockMin ? 'warning' : 'success' },
      { label: 'Stock mínimo', value: item.stockMin, icon: <AlertTriangle size={16} />, tone: 'default' },
      { label: 'Stock máximo', value: item.stockMax, icon: <BarChart3 size={16} />, tone: 'primary' },
      { label: 'Precio', value: `$${item.precio.toLocaleString()}`, icon: <CreditCard size={16} />, tone: 'info' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Medida:</span> {item.medida}</div>
        <div className={s.detailRow}><span>Precio:</span> ${item.precio.toLocaleString()}</div>
        <div className={s.detailRow}><span>Proveedor:</span> {item.proveedor || '—'}</div>
        <div className={s.detailRow}><span>Stock mínimo:</span> {item.stockMin}</div>
        <div className={s.detailRow}><span>Stock máximo:</span> {item.stockMax}</div>
      </div>
    ),
  };

  const actions = ((item: Insumo): DataTableAction<Insumo>[] => [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (i) => { setSelectedInsumo(i); setModalOpen(true); } },
    { label: item.estado === 'Activo' ? 'Desactivar' : 'Activar', icon: <ToggleLeft size={14} />, onClick: () => handleToggleEstado(item) },
    { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: () => handleEliminar(item) },
  ]) as DataTableAction<Insumo>[] | ((item: Insumo) => DataTableAction<Insumo>[]);

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Insumos</h1>
          <p className={s.pageSubtitle}>Inventario de insumos</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo Insumo
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar insumos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filteredInsumos}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          emptyMessage={loading ? 'Cargando insumos...' : error ? error : 'Sin resultados'}
          maxVisibleColumns={5}
        />
      </div>

      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {selectedInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
              </h2>
              <button className={s.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <div className={s.modalBody}>
              <form className={s.form} ref={formRef}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Código</label>
                    <input type="text" className={s.input} name="codigo" defaultValue={selectedInsumo?.codigo} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Nombre</label>
                    <input type="text" className={s.input} name="nombre" defaultValue={selectedInsumo?.nombre} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Categoría</label>
                    <select className={s.select} name="categoria" defaultValue={selectedInsumo?.categoria}>
                      {CATEGORIAS_INSUMO.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Medida</label>
                    <select className={s.select} name="medida" defaultValue={selectedInsumo?.medida}>
                      {UNIDADES_MEDIDA_INSUMO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Stock mínimo</label>
                    <input type="number" className={s.input} name="stockMin" defaultValue={selectedInsumo?.stockMin} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Stock máximo</label>
                    <input type="number" className={s.input} name="stockMax" defaultValue={selectedInsumo?.stockMax} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Precio</label>
                    <input type="number" className={s.input} name="precio" defaultValue={selectedInsumo?.precio} />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Proveedor</label>
                    <select className={s.select} name="proveedor" defaultValue={selectedInsumo?.proveedor}>
                      <option value="">Sin proveedor</option>
                      {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className={s.formActions}>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitInsumo}>
                    {selectedInsumo ? 'Guardar cambios' : 'Crear insumo'}
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
            await stockApi.rawMaterials.remove(deleteConfirm.id);
            setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
            toast.success('Insumo eliminado');
          } catch {
            toast.error('No fue posible guardar el insumo');
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Eliminar insumo"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
