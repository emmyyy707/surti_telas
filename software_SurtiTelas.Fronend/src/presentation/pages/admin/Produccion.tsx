import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import s from './Produccion.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { productionApi, type ProductionOrder, type ProductionItem } from '@/infrastructure/api/productionApi';
import { authApi } from '@/infrastructure/api/authApi';
import { Package, Plus, Clock, AlertTriangle, X } from 'lucide-react';

interface OrdenProduccion {
  id: string;
  pedido: string;
  operarioId: string;
  operarioNombre: string;
  tallerId?: string;
  tallerNombre?: string;
  referencia: string;
  cantidad: number;
  fechaInicio: string;
  fechaEstimada: string;
  avance: number;
  estado: 'Pendiente' | 'Asignada' | 'En produccion' | 'Completada';
  tela?: string;
  colores: string[];
  notasTecnicas?: string;
  items: ProductionItem[];
}

interface UsuarioOption {
  id: string;
  nombre: string;
}

interface TallerOption {
  id: string;
  nombre: string;
}

  const ESTADO_TO_UI: Record<string, OrdenProduccion['estado']> = {
    PENDIENTE: 'Pendiente',
    ASIGNADA: 'Asignada',
    EN_PROCESO: 'En produccion',
    TERMINADO: 'Completada',
  };
  const _ESTADO_TO_API: Record<string, string> = {
    Pendiente: 'PENDIENTE',
    Asignada: 'ASIGNADA',
    'En produccion': 'EN_PROCESO',
    Completada: 'TERMINADO',
  };

  function toOrden(o: ProductionOrder, operarios: UsuarioOption[] = [], talleres: TallerOption[] = []): OrdenProduccion {
    const operario = operarios.find(u => u.id === o.operarioId);
    const taller = talleres.find(t => t.id === o.tallerId);
    return {
      id: o.id,
      pedido: o.pedidoNumero ?? '',
      operarioId: o.operarioId ?? '',
      operarioNombre: operario?.nombre ?? (o.operario?.nombre ?? 'Sin asignar'),
      tallerId: o.tallerId,
      tallerNombre: taller?.nombre ?? o.taller?.nombre ?? 'Sin asignar',
      referencia: o.referencia,
      cantidad: o.cantidad,
      fechaInicio: o.fechaInicio,
      fechaEstimada: o.fechaEstimada,
      avance: o.avance,
      estado: ESTADO_TO_UI[o.estado] ?? 'Pendiente',
      tela: o.tela,
      colores: o.colores,
      notasTecnicas: o.notasTecnicas,
      items: o.items ?? [],
    };
  }

export const AdminProduccion: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenProduccion | null>(null);
  const [items, setItems] = useState<OrdenProduccion[]>([]);
  const [selectedItems, setSelectedItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operarios, setOperarios] = useState<UsuarioOption[]>([]);
  const [talleres, setTalleres] = useState<TallerOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<OrdenProduccion | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<ProductionItem | null>(null);
  const [createItems, setCreateItems] = useState<Partial<ProductionItem>[]>([]);
  const [createItemNombre, setCreateItemNombre] = useState('');
  const [createItemCantidad, setCreateItemCantidad] = useState(1);
  const [createItemUnidad, setCreateItemUnidad] = useState('');
  const [createItemPrecio, setCreateItemPrecio] = useState(0);
  const [createItemDescripcion, setCreateItemDescripcion] = useState('');
  const [_createTallas, _setCreateTallas] = useState('');

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionApi.list();
      setItems(data.map(o => toOrden(o, operarios, talleres)));
    } catch {
      setError('No se pudieron cargar las órdenes de producción');
    } finally {
      setLoading(false);
    }
  }, [operarios, talleres]);

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [usersData, _workshopsData] = await Promise.all([
        authApi.listUsers(),
        productionApi.list().catch(() => []),
      ]);
      const users = (usersData as { data: Array<{ id: string; nombre: string; role: string }> }).data;
      const mappedOperarios: UsuarioOption[] = users
        .filter(u => u.role === 'ASESOR' || u.role === 'ADMIN' || u.role === 'PRODUCCION')
        .map(u => ({ id: u.id, nombre: u.nombre }));
      setOperarios(mappedOperarios);
      setTalleres([]);
    } catch {
      toast.error('No se pudieron cargar las opciones');
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    void fetchOrdenes();
  }, [fetchOrdenes]);

  const filtered = useMemo(() => {
    return items.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.pedido.toLowerCase().includes(search.toLowerCase()) ||
      o.referencia.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const closeModals = () => {
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setSelectedOrden(null);
  };

  const handleCreateOrden = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const referencia = String(fd.get('referencia') ?? '').trim();
    const cantidad = Number(fd.get('cantidad'));
    const fechaEstimada = String(fd.get('fechaEstimada') ?? '').trim();
    const tela = String(fd.get('tela') ?? '').trim() || undefined;
    const coloresStr = String(fd.get('colores') ?? '').trim();
    const colores = coloresStr ? coloresStr.split(',').map(c => c.trim()).filter(Boolean) : [];
    const tallasStr = String(fd.get('tallas') ?? '').trim();
    const curvaTallas: Record<string, number> = {};
    if (tallasStr) {
      tallasStr.split(',').forEach(part => {
        const [talla, cantidad] = part.split(':').map(s => s.trim());
        if (talla && cantidad && !isNaN(Number(cantidad))) {
          curvaTallas[talla] = Number(cantidad);
        }
      });
    }
    const notasTecnicas = String(fd.get('notasTecnicas') ?? '').trim() || undefined;
    try {
      const created = await productionApi.create({
        referencia,
        cantidad,
        fechaEstimada,
        tela,
        colores,
        curvaTallas: Object.keys(curvaTallas).length > 0 ? curvaTallas : undefined,
        notasTecnicas,
      });
      if (createItems.length > 0) {
        await Promise.all(createItems.map(item =>
          productionApi.createItem(created.id, {
            nombre: item.nombre ?? '',
            cantidad: item.cantidad ?? 1,
            descripcion: item.descripcion,
            unidad: item.unidad,
            precioUnitario: item.precioUnitario,
          })
        ));
      }
      setItems(prev => [...prev, toOrden(created, operarios, talleres)]);
      toast.success('Orden de producción creada');
      setCreateModalOpen(false);
      setCreateItems([]);
      setCreateItemNombre('');
      setCreateItemCantidad(1);
      setCreateItemUnidad('');
      setCreateItemPrecio(0);
      setCreateItemDescripcion('');
    } catch {
      toast.error('No fue posible crear la orden');
    }
  };

  const handleAddCreateItem = () => {
    if (!createItemNombre.trim()) {
      toast.error('El nombre del item es obligatorio');
      return;
    }
    if (createItemCantidad < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    setCreateItems(prev => [...prev, {
      nombre: createItemNombre.trim(),
      cantidad: createItemCantidad,
      unidad: createItemUnidad.trim() || undefined,
      precioUnitario: createItemPrecio || undefined,
      descripcion: createItemDescripcion.trim() || undefined,
    }]);
    setCreateItemNombre('');
    setCreateItemCantidad(1);
    setCreateItemUnidad('');
    setCreateItemPrecio(0);
    setCreateItemDescripcion('');
  };

  const handleRemoveCreateItem = (index: number) => {
    setCreateItems(prev => prev.filter((_, i) => i !== index));
  };

  const _estadoToApi: Record<string, string> = {
    Pendiente: 'PENDIENTE',
    Asignada: 'ASIGNADA',
    'En produccion': 'EN_PROCESO',
    Completada: 'TERMINADO',
  };

  const handleSubmitOrden = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrden) return;
    const fd = new FormData(e.currentTarget);
    const operarioId = String(fd.get('operarioId') ?? '').trim();
    const estado = (String(fd.get('estado') ?? '') || selectedOrden.estado) as OrdenProduccion['estado'];
    try {
      const actualizado = await productionApi.update(selectedOrden.id, {
        operarioId: operarioId || undefined,
        estado: estado as OrdenProduccion['estado'],
      });
      setItems(prev => prev.map(it => it.id === selectedOrden.id ? toOrden(actualizado, operarios, talleres) : it));
      toast.success('Orden actualizada');
      closeModals();
    } catch {
      toast.error('No fue posible actualizar la orden');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productionApi.remove(deleteConfirm.id);
      setItems(prev => prev.filter(it => it.id !== deleteConfirm.id));
      toast.success('Orden eliminada');
    } catch {
      toast.error('No fue posible eliminar la orden');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleOpenItems = async (orden: OrdenProduccion) => {
    setSelectedOrden(orden);
    try {
      const data = await productionApi.listItems(orden.id);
      setSelectedItems(data);
      setItemsModalOpen(true);
    } catch {
      toast.error('No se pudieron cargar los items');
    }
  };

  const handleCreateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrden) return;
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const cantidad = Number(fd.get('cantidad'));
    const descripcion = String(fd.get('descripcion') ?? '').trim() || undefined;
    const unidad = String(fd.get('unidad') ?? '').trim() || undefined;
    const precioUnitario = fd.get('precioUnitario') ? Number(fd.get('precioUnitario')) : undefined;
    try {
      const created = await productionApi.createItem(selectedOrden.id, {
        nombre,
        cantidad,
        descripcion,
        unidad,
        precioUnitario,
      });
      setSelectedItems(prev => [...prev, created]);
      toast.success('Item agregado');
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('No fue posible agregar el item');
    }
  };

  const _handleUpdateItem = async (item: ProductionItem, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const cantidad = Number(fd.get('cantidad'));
    const descripcion = String(fd.get('descripcion') ?? '').trim() || undefined;
    const unidad = String(fd.get('unidad') ?? '').trim() || undefined;
    const precioUnitario = fd.get('precioUnitario') ? Number(fd.get('precioUnitario')) : undefined;
    try {
      const updated = await productionApi.updateItem(selectedOrden!.id, item.id, {
        nombre,
        cantidad,
        descripcion,
        unidad,
        precioUnitario,
      });
      setSelectedItems(prev => prev.map(it => it.id === item.id ? updated : it));
      toast.success('Item actualizado');
    } catch {
      toast.error('No fue posible actualizar el item');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemConfirm || !selectedOrden) return;
    try {
      await productionApi.removeItem(selectedOrden.id, deleteItemConfirm.id);
      setSelectedItems(prev => prev.filter(it => it.id !== deleteItemConfirm.id));
      toast.success('Item eliminado');
    } catch {
      toast.error('No fue posible eliminar el item');
    } finally {
      setDeleteItemConfirm(null);
    }
  };

  const columns: DataTableColumn<OrdenProduccion>[] = [
    { key: 'id', header: 'ID Orden', sortable: true },
    { key: 'pedido', header: 'Pedido', sortable: true },
    { key: 'referencia', header: 'Referencia', sortable: true },
    { key: 'cantidad', header: 'Cantidad', sortable: true, align: 'right' },
    { key: 'estado', header: 'Estado', sortable: true, render: (item) => (
      <Badge variant={item.estado === 'Completada' ? 'success' : item.estado === 'En produccion' || item.estado === 'Asignada' ? 'warning' : 'default'}>
        {item.estado}
      </Badge>
    )},
    { key: 'tallerNombre', header: 'Taller', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<OrdenProduccion> = {
    title: item => `Detalle: ${item.id}`,
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailSection}>
          <h3 className={s.detailSectionTitle}>Información general</h3>
          <div className={s.detailGrid}>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Referencia</span>
              <span className={s.emptyText}>{item.referencia}</span>
            </div>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Cantidad</span>
              <span className={s.emptyText}>{item.cantidad}</span>
            </div>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Operario</span>
              <span className={s.emptyText}>{item.operarioNombre}</span>
            </div>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Taller</span>
              <span className={s.emptyText}>{item.tallerNombre}</span>
            </div>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Fecha inicio</span>
              <span className={s.emptyText}>{item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString() : '-'}</span>
            </div>
            <div className={s.detailItem}>
              <span className={s.detailLabel}>Fecha estimada</span>
              <span className={s.emptyText}>{item.fechaEstimada ? new Date(item.fechaEstimada).toLocaleDateString() : '-'}</span>
            </div>
            <div className={s.detailItem} style={{ gridColumn: '1 / -1' }}>
              <span className={s.detailLabel}>Avance</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={s.progressBar} style={{ width: 200 }}>
                  <div className={s.progressFill} style={{ width: `${item.avance}%` }} />
                </div>
                <span className={s.emptyText}>{item.avance}%</span>
              </div>
            </div>
            <div className={s.detailItem} style={{ gridColumn: '1 / -1' }}>
              <span className={s.detailLabel}>Tela</span>
              <span className={s.emptyText}>{item.tela || '-'}</span>
            </div>
            <div className={s.detailItem} style={{ gridColumn: '1 / -1' }}>
              <span className={s.detailLabel}>Colores</span>
              <span className={s.emptyText}>{item.colores.join(', ') || '-'}</span>
            </div>
            <div className={s.detailItem} style={{ gridColumn: '1 / -1' }}>
              <span className={s.detailLabel}>Notas técnicas</span>
              <span className={s.emptyText}>{item.notasTecnicas || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const actions: DataTableAction<OrdenProduccion>[] = [
    { label: 'Editar', onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
    { label: 'Items', onClick: (item) => { void handleOpenItems(item); } },
    { label: 'Eliminar', onClick: (item) => { setDeleteConfirm(item); }, danger: true },
  ];

  const pendientes = useMemo(() => items.filter(i => i.estado === 'Pendiente').length, [items]);
  const enProceso = useMemo(() => items.filter(i => i.estado === 'En produccion' || i.estado === 'Asignada').length, [items]);
  const completadas = useMemo(() => items.filter(i => i.estado === 'Completada').length, [items]);

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Producción</h1>
          <p className={s.pageSubtitle}>Órdenes de producción activas</p>
        </div>
        <div className={s.headerActions}>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>Nueva Orden</Button>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <Package className={s.statIcon} />
          <div>
            <div className={s.statValue}>{items.length}</div>
            <div className={s.statLabel}>Total órdenes</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardDanger}`}>
          <AlertTriangle className={s.statIconDanger} />
          <div>
            <div className={s.statValue}>{pendientes}</div>
            <div className={s.statLabel}>Pendientes</div>
          </div>
        </div>
        <div className={s.statCard}>
          <Clock className={s.statIcon} />
          <div>
            <div className={s.statValue}>{enProceso}</div>
            <div className={s.statLabel}>En proceso / Asignadas</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardSuccess}`}>
          <Package className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{completadas}</div>
            <div className={s.statLabel}>Completadas</div>
          </div>
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <SearchInput
            placeholder="Buscar órdenes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => setSearch(value)}
            debounceMs={100}
            minChars={0}
          />
        </div>
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filtered}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableSorting={true}
          emptyMessage={loading ? 'Cargando órdenes...' : error ? error : 'No se encontraron órdenes'}
          toolbarLeft={null}
          maxVisibleColumns={5}
          enableExport={false}
          enableRowSelection={false}
        />
      </div>

      {createModalOpen && (
        <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva Orden de Producción" size="lg">
          <form className={f.form} onSubmit={handleCreateOrden}>
            <div className={f.formSection}>
              <h3 className={f.sectionTitle}>Datos de la orden</h3>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Referencia</label>
                  <input className={f.input} name="referencia" required />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Cantidad</label>
                  <input className={f.input} name="cantidad" type="number" min={1} required />
                </div>
              </div>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Fecha estimada</label>
                  <input className={f.input} name="fechaEstimada" type="date" required />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Tela</label>
                  <input className={f.input} name="tela" placeholder="Tipo de tela" />
                </div>
              </div>
               <div className={f.formRow}>
                 <div className={f.field}>
                   <label className={f.label}>Colores</label>
                   <input className={f.input} name="colores" placeholder="Separados por coma: Rojo, Azul, Verde" />
                   <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                     Ingrese los colores separados por coma.
                   </small>
                 </div>
                 <div className={f.field}>
                   <label className={f.label}>Tallas</label>
                   <input className={f.input} name="tallas" placeholder="Ej: S:10, M:20, L:15" />
                   <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                     Ingrese talla:cantidad separadas por coma.
                   </small>
                 </div>
               </div>
              <div className={f.field}>
                <label className={f.label}>Notas técnicas</label>
                <textarea className={f.input} name="notasTecnicas" rows={3} />
              </div>
            </div>
            <div className={f.formSection}>
              <h3 className={f.sectionTitle}>Insumos / Items</h3>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Nombre del insumo</label>
                  <input className={f.input} value={createItemNombre} onChange={e => setCreateItemNombre(e.target.value)} placeholder="Ej: Botones, Hilo, Cremallera" />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Cantidad</label>
                  <input className={f.input} type="number" min={1} value={createItemCantidad} onChange={e => setCreateItemCantidad(Number(e.target.value))} />
                </div>
              </div>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Unidad</label>
                  <input className={f.input} value={createItemUnidad} onChange={e => setCreateItemUnidad(e.target.value)} placeholder="Ej: Unidades, Metros, Kilos" />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Precio unitario</label>
                  <input className={f.input} type="number" min={0} step="0.01" value={createItemPrecio} onChange={e => setCreateItemPrecio(Number(e.target.value))} />
                </div>
              </div>
              <div className={f.field}>
                <label className={f.label}>Descripción</label>
                <input className={f.input} value={createItemDescripcion} onChange={e => setCreateItemDescripcion(e.target.value)} placeholder="Descripción opcional del insumo" />
              </div>
              <div style={{ marginTop: 8 }}>
                <Button type="button" variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={handleAddCreateItem}>
                  Agregar insumo
                </Button>
              </div>
              {createItems.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Precio</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {createItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.unidad || '-'}</td>
                          <td>{item.precioUnitario ? `$${item.precioUnitario.toFixed(2)}` : '-'}</td>
                          <td>
                            <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveCreateItem(idx)}>
                              <X size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className={f.formActions}>
              <Button variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Crear orden</Button>
            </div>
          </form>
        </Modal>
      )}

      {editModalOpen && selectedOrden && (
        <Modal open={editModalOpen} onClose={closeModals} title="Editar Orden de Producción" size="md">
          <form className={f.form} onSubmit={handleSubmitOrden}>
            <div className={f.formSection}>
              <h3 className={f.sectionTitle}>Datos de la orden</h3>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Operario asignado</label>
                  <select className={f.select} name="operarioId" defaultValue={selectedOrden.operarioId} disabled={loadingOptions}>
                    <option value="">-- Seleccione un operario --</option>
                    {operarios.map(op => (
                      <option key={op.id} value={op.id}>{op.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className={f.field}>
                  <label className={f.label}>Estado</label>
                  <select className={f.select} name="estado" defaultValue={selectedOrden.estado}>
                    <option>Pendiente</option>
                    <option>Asignada</option>
                    <option>En produccion</option>
                    <option>Completada</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={f.formActions}>
              <Button variant="secondary" type="button" onClick={closeModals}>Cancelar</Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </Modal>
      )}

      {itemsModalOpen && selectedOrden && (
        <Modal open={itemsModalOpen} onClose={() => setItemsModalOpen(false)} title={`Items: ${selectedOrden.referencia}`} size="lg">
          <div className={s.itemsContainer}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Precio unitario</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.unidad || '-'}</td>
                    <td>{item.precioUnitario ? `$${item.precioUnitario.toFixed(2)}` : '-'}</td>
                    <td>${((item.precioUnitario ?? 0) * item.cantidad).toFixed(2)}</td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedOrden(prev => prev ? { ...prev, items: selectedItems.filter(i => i.id !== item.id) } : null); setSelectedItems(prev => prev.map(i => i.id === item.id ? { ...i, nombre: '', cantidad: 0 } : i)); }}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteItemConfirm(item)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
                {selectedItems.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No hay items registrados</td></tr>
                )}
              </tbody>
            </table>
            <form className={f.form} onSubmit={handleCreateItem}>
              <h4 className={f.sectionTitle}>Agregar item</h4>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Nombre</label>
                  <input className={f.input} name="nombre" required />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Cantidad</label>
                  <input className={f.input} name="cantidad" type="number" min={1} required />
                </div>
              </div>
              <div className={f.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Unidad</label>
                  <input className={f.input} name="unidad" />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Precio unitario</label>
                  <input className={f.input} name="precioUnitario" type="number" min={0} step="0.01" />
                </div>
              </div>
              <div className={f.field}>
                <label className={f.label}>Descripción</label>
                <textarea className={f.input} name="descripcion" rows={2} />
              </div>
              <div className={f.formActions}>
                <Button variant="secondary" type="button" onClick={() => setItemsModalOpen(false)}>Cerrar</Button>
                <Button type="submit">Agregar item</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <ConfirmationModal
          open
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Eliminar orden"
          description={`¿Seguro que deseas eliminar la orden ${deleteConfirm.id}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          variant="danger"
        />
      )}

      {deleteItemConfirm && (
        <ConfirmationModal
          open
          onClose={() => setDeleteItemConfirm(null)}
          onConfirm={handleDeleteItem}
          title="Eliminar item"
          description={`¿Seguro que deseas eliminar el item "${deleteItemConfirm.nombre}"?`}
          confirmLabel="Eliminar"
          variant="danger"
        />
      )}
    </div>
  );
};
