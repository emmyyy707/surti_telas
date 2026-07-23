import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import s from './Produccion.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { productionApi, type ProductionOrder } from '@/infrastructure/api/productionApi';
import { authApi } from '@/infrastructure/api/authApi';

interface OrdenProduccion {
  id: string;
  pedido: string;
  operarioId: string;
  operarioNombre: string;
  referencia: string;
  cantidad: number;
  fechaInicio: string;
  fechaEstimada: string;
  avance: number;
  estado: 'Pendiente' | 'Asignada' | 'En produccion' | 'Completada';
}

interface UsuarioOption {
  id: string;
  nombre: string;
}

function toOrden(o: ProductionOrder, operarios: UsuarioOption[] = []): OrdenProduccion {
  const operario = operarios.find(u => u.id === o.operarioId);
  return {
    id: o.id,
    pedido: o.pedidoId ?? '',
    operarioId: o.operarioId ?? '',
    operarioNombre: operario?.nombre ?? (o.operario?.nombre ?? 'Sin asignar'),
    referencia: o.referencia,
    cantidad: o.cantidad,
    fechaInicio: o.fechaInicio,
    fechaEstimada: o.fechaEstimada,
    avance: o.avance,
    estado: o.estado,
  };
}

export const AdminProduccion: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenProduccion | null>(null);
  const [items, setItems] = useState<OrdenProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operarios, setOperarios] = useState<UsuarioOption[]>([]);
  const [loadingOperarios, setLoadingOperarios] = useState(true);

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionApi.list();
      setItems(data.map(o => toOrden(o, operarios)));
    } catch {
      setError('No se pudieron cargar las órdenes de producción');
    } finally {
      setLoading(false);
    }
  }, [operarios]);

  const fetchOperarios = useCallback(async () => {
    setLoadingOperarios(true);
    try {
      const data = await authApi.listUsers();
      const mapped: UsuarioOption[] = (data as { data: Array<{ id: string; nombre: string; role: string }> }).data
        .filter(u => u.role === 'ASESOR' || u.role === 'ADMIN' || u.role === 'DOMICILIARIO')
        .map(u => ({ id: u.id, nombre: u.nombre }));
      setOperarios(mapped);
    } catch {
      toast.error('No se pudieron cargar los operarios');
    } finally {
      setLoadingOperarios(false);
    }
  }, []);

  useEffect(() => {
    void fetchOperarios();
  }, [fetchOperarios]);

  useEffect(() => {
    void fetchOrdenes();
  }, [fetchOrdenes]);

  const filtered = useMemo(() => {
    return items.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.pedido.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const closeModals = () => {
    setEditModalOpen(false);
    setSelectedOrden(null);
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
        estado,
      });
      setItems(prev => prev.map(it => it.id === selectedOrden.id ? toOrden(actualizado, operarios) : it));
      toast.success('Orden actualizada');
      closeModals();
    } catch {
      toast.error('No fue posible actualizar la orden');
    }
  };

  const columns: DataTableColumn<OrdenProduccion>[] = [
    { key: 'id', header: 'ID Orden', sortable: true },
    { key: 'pedido', header: 'Pedido', sortable: true },
    { key: 'referencia', header: 'Referencia', sortable: true },
    { key: 'cantidad', header: 'Cantidad', sortable: true, align: 'right' },
    { key: 'estado', header: 'Estado', sortable: true },
  ];

  const detailPanel: DataTableDetailPanel<OrdenProduccion> = {
    title: item => `Detalle: ${item.id}`,
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Operario:</span> {item.operarioNombre}</div>
        <div className={s.detailRow}><span>Referencia:</span> {item.referencia}</div>
        <div className={s.detailRow}><span>Cantidad:</span> {item.cantidad}</div>
        <div className={s.detailRow}><span>Fecha inicio:</span> {item.fechaInicio || '-'}</div>
        <div className={s.detailRow}><span>Fecha estimada:</span> {item.fechaEstimada}</div>
        <div className={s.detailRow}><span>Avance:</span> {item.avance}%</div>
        <div className={s.progressBar}>
          <div className={s.progressFill} style={{ width: `${item.avance}%` }} />
        </div>
      </div>
    ),
  };

  const actions: DataTableAction<OrdenProduccion>[] = [
    { label: 'Editar', onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
  ];

  return (
    <div>
      <h1 className={s.pageTitle}>Producción</h1>
      <p className={s.pageSubtitle}>Órdenes de producción activas</p>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar órdenes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filtered}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          emptyMessage={loading ? 'Cargando órdenes...' : error ? error : 'No se encontraron órdenes'}
          toolbarLeft={null}
          maxVisibleColumns={5}
        />
      </div>

      {editModalOpen && selectedOrden && (
        <Modal
          open={editModalOpen}
          onClose={closeModals}
          title="Editar Orden de Producción"
          size="md"
        >
          <form className={s.form} onSubmit={handleSubmitOrden}>
            <div className={s.formRow}>
              <div className={s.field}>
                <label className={s.label}>Operario asignado</label>
                <select className={s.select} name="operarioId" defaultValue={selectedOrden.operarioId} disabled={loadingOperarios}>
                  <option value="">-- Seleccione un operario --</option>
                  {operarios.map(op => (
                    <option key={op.id} value={op.id}>{op.nombre}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Estado</label>
                <select className={s.select} name="estado" defaultValue={selectedOrden.estado}>
                  <option>Pendiente</option>
                  <option>Asignada</option>
                  <option>En produccion</option>
                  <option>Completada</option>
                </select>
              </div>
            </div>
            <div className={s.formActions}>
              <Button variant="secondary" type="button" onClick={closeModals}>Cancelar</Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
