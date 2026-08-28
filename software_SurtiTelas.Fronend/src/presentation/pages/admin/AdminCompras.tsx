import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Download, X, Package, DollarSign, Eye } from 'lucide-react';
import s from './AdminCompras.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { purchasesApi, type PurchaseDTO, type PurchaseItemDTO } from '@/infrastructure/api/purchasesApi';
import { suppliersApi } from '@/infrastructure/api/suppliersApi';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

export const AdminCompras: React.FC = () => {
  const [compras, setCompras] = useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PurchaseDTO | null>(null);
  const [items, setItems] = useState<PurchaseItemDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [cancelling, setCancelling] = useState<PurchaseDTO | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState<PurchaseDTO | null>(null);
  const [detailItems, setDetailItems] = useState<PurchaseItemDTO[]>([]);

  const [formNumero, setFormNumero] = useState('');
  const [formProveedorId, setFormProveedorId] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [formItems, setFormItems] = useState<{ rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; nombre: string }[]>([]);

  const pagination = useServerPagination(10);

  const fetchCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: Record<string, string | number | boolean | undefined | null> = {
        page: pagination.page,
        limit: pagination.limit,
        sort: 'fecha',
        order: 'desc',
      };
      if (debouncedSearch.trim()) query.search = debouncedSearch.trim();
      const result = await purchasesApi.list(query);
      setCompras(result.items);
      pagination.setTotalRecords(result.meta.totalRecords);
    } catch {
      setError('No se pudieron cargar las compras');
      toast.error('No se pudieron cargar las compras');
    } finally {
      setLoading(false);
    }
  }, [pagination, debouncedSearch]);

  useEffect(() => {
    void fetchCompras();
  }, [fetchCompras]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const result = await suppliersApi.list({ limit: 100 });
        setSuppliers(result.data.map(s => ({ id: s.id, nombre: s.nombre })));
      } catch {
        // ignore
      }
    };
    void loadSuppliers();
  }, []);

  const resetForm = () => {
    setFormNumero('');
    setFormProveedorId('');
    setFormObservaciones('');
    setFormItems([{ nombre: '', cantidad: 1, precioUnitario: 0 }]);
    setEditing(null);
    setItems([]);
    setSaving(false);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = async (compra: PurchaseDTO) => {
    setEditing(compra);
    setFormNumero(compra.numero);
    setFormProveedorId(compra.proveedorId);
    setFormObservaciones(compra.observaciones ?? '');
    const compraItems = await purchasesApi.getItems(compra.id);
    setItems(compraItems);
    setFormItems(compraItems.length ? compraItems.map(i => ({ rawMaterialId: i.rawMaterialId, nombre: i.nombre, cantidad: i.cantidad, precioUnitario: i.precioUnitario })) : [{ nombre: '', cantidad: 1, precioUnitario: 0 }]);
    setModalOpen(true);
  };

  const openDetail = async (compra: PurchaseDTO) => {
    setDetailCompra(compra);
    const compraItems = await purchasesApi.getItems(compra.id);
    setDetailItems(compraItems);
    setDetailModalOpen(true);
  };

  const handleSave = async () => {
    if (!formNumero.trim() || !formProveedorId) {
      toast.error('Número y proveedor son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const itemsPayload = formItems.filter(i => i.nombre.trim());
      if (itemsPayload.length === 0) {
        toast.error('Agrega al menos un ítem');
        setSaving(false);
        return;
      }
      const total = itemsPayload.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
      if (editing) {
        const updated = await purchasesApi.update(editing.id, { observaciones: formObservaciones });
        setCompras(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        toast.success('Compra actualizada');
      } else {
        const created = await purchasesApi.create({
          numero: formNumero,
          proveedorId: formProveedorId,
          usuarioId: 'system',
          total,
          observaciones: formObservaciones,
          items: itemsPayload,
        });
        setCompras(prev => [created, ...prev]);
        toast.success('Compra creada');
      }
      setModalOpen(false);
      resetForm();
      void fetchCompras();
    } catch {
      toast.error('No se pudo guardar la compra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await purchasesApi.remove(deleteConfirm.id);
      setCompras(prev => prev.filter(c => c.id !== deleteConfirm.id));
      toast.success('Compra eliminada');
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar la compra');
    }
  };

  const handleCancel = async () => {
    if (!cancelling || !cancelMotivo.trim()) return;
    try {
      const updated = await purchasesApi.cancel(cancelling.id, cancelMotivo);
      setCompras(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      toast.success('Compra anulada');
      setCancelModalOpen(false);
      setCancelling(null);
      setCancelMotivo('');
    } catch {
      toast.error('No se pudo anular la compra');
    }
  };

  const handleExportPdf = async (compra: PurchaseDTO) => {
    try {
      const blob = await purchasesApi.exportPdf(compra.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compra-${compra.numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  const addItem = () => {
    setFormItems(prev => [...prev, { nombre: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const columns: DataTableColumn<PurchaseDTO>[] = [
    {
      key: 'numero',
      header: 'Número',
      sortable: true,
      render: (c) => <span style={{ fontWeight: 600 }}>{c.numero}</span>,
    },
    {
      key: 'proveedorId',
      header: 'Proveedor',
      render: (c) => suppliers.find(s => s.id === c.proveedorId)?.nombre ?? c.proveedorId,
    },
    {
      key: 'total',
      header: 'Total',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (c) => <span className={s.tdRight}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(c.total)}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '120px',
      render: (c) => {
        const variant = c.estado === 'PENDIENTE' ? 'default' : c.estado === 'RECIBIDA' ? 'success' : c.estado === 'CANCELADA' ? 'warning' : 'danger';
        return <Badge variant={variant}>{c.estado}</Badge>;
      },
    },
    {
      key: 'fecha',
      header: 'Fecha',
      width: '120px',
      sortable: true,
      render: (c) => new Date(c.fecha).toLocaleDateString(),
    },
  ];

  const actions = (c: PurchaseDTO) => [
    { label: 'Ver detalle', icon: <Eye size={14} />, onClick: () => openDetail(c) },
    { label: 'Editar', icon: <Edit size={14} />, onClick: () => openEdit(c) },
    { label: 'Anular', icon: <X size={14} />, onClick: () => { setCancelling(c); setCancelModalOpen(true); }, disabled: c.estado === 'ANULADA' || c.estado === 'CANCELADA' },
    { label: 'PDF', icon: <Download size={14} />, onClick: () => handleExportPdf(c) },
    { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(c), danger: true },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Compras</h1>
          <p className={s.pageSubtitle}>Gestión de compras a proveedores</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nueva compra
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar compras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          debounceMs={300}
          minChars={0}
        />
      </div>

      <DataTable
        data={compras}
        columns={columns}
        actions={actions}
        pageSize={pagination.limit}
        emptyMessage={loading ? 'Cargando...' : error ?? 'No hay compras'}
        serverMode
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalRecords}
        onPageChange={(newPage) => pagination.setPage(newPage)}
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editing ? 'Editar compra' : 'Nueva compra'} size="lg">
        <form className={f.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className={s.formRow}>
            <div className={f.field}>
              <label className={f.label}>Número *</label>
              <input className={f.input} value={formNumero} onChange={(e) => setFormNumero(e.target.value)} />
            </div>
            <div className={f.field}>
              <label className={f.label}>Proveedor *</label>
              <select className={f.select} value={formProveedorId} onChange={(e) => setFormProveedorId(e.target.value)}>
                <option value="">Seleccione...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Observaciones</label>
            <textarea className={f.textarea} value={formObservaciones} onChange={(e) => setFormObservaciones(e.target.value)} rows={3} />
          </div>

          <div className={s.itemsSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={f.label}>Partidas</label>
              <Button type="button" variant="secondary" leftIcon={<Plus size={14} />} onClick={addItem}>Agregar ítem</Button>
            </div>
            {formItems.map((item, idx) => (
              <div key={idx} className={s.itemRow}>
                <input className={f.input} placeholder="Nombre insumo" value={item.nombre} onChange={(e) => updateItem(idx, 'nombre', e.target.value)} />
                <input className={f.input} type="number" placeholder="Cant." value={item.cantidad} onChange={(e) => updateItem(idx, 'cantidad', Number(e.target.value))} />
                <input className={f.input} type="number" placeholder="Precio" value={item.precioUnitario} onChange={(e) => updateItem(idx, 'precioUnitario', Number(e.target.value))} />
                <Button type="button" variant="danger" onClick={() => removeItem(idx)}><Trash2 size={14} /></Button>
              </div>
            ))}
          </div>

          <ModalFooter
            secondary={{ label: 'Cancelar', onClick: () => { setModalOpen(false); resetForm(); } }}
            primary={{ label: editing ? 'Guardar cambios' : 'Crear compra', type: 'submit', loading: saving }}
          />
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar compra"
        description={`¿Estás seguro de que deseas eliminar la compra "${deleteConfirm?.numero}"?`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <Modal open={cancelModalOpen} onClose={() => { setCancelModalOpen(false); setCancelling(null); setCancelMotivo(''); }} title="Anular compra" size="sm">
        <div className={f.form}>
          <div className={f.field}>
            <label className={f.label}>Motivo de anulación *</label>
            <textarea className={f.textarea} value={cancelMotivo} onChange={(e) => setCancelMotivo(e.target.value)} rows={3} />
          </div>
          <ModalFooter
            secondary={{ label: 'Cancelar', onClick: () => { setCancelModalOpen(false); setCancelling(null); setCancelMotivo(''); } }}
            primary={{ label: 'Anular compra', onClick: handleCancel }}
          />
        </div>
      </Modal>

      <Modal open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setDetailCompra(null); setDetailItems([]); }} title={`Detalle de compra ${detailCompra?.numero ?? ''}`} size="lg">
        <div className={f.form}>
          {detailCompra && (
            <>
              <div className={s.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Número</label>
                  <input className={f.input} value={detailCompra.numero} readOnly />
                </div>
                <div className={f.field}>
                  <label className={f.label}>Proveedor</label>
                  <input className={f.input} value={suppliers.find(s => s.id === detailCompra.proveedorId)?.nombre ?? detailCompra.proveedorId} readOnly />
                </div>
              </div>
              <div className={s.formRow}>
                <div className={f.field}>
                  <label className={f.label}>Estado</label>
                  <Badge variant={detailCompra.estado === 'PENDIENTE' ? 'default' : detailCompra.estado === 'RECIBIDA' ? 'success' : detailCompra.estado === 'CANCELADA' ? 'warning' : 'danger'}>{detailCompra.estado}</Badge>
                </div>
                <div className={f.field}>
                  <label className={f.label}>Total</label>
                  <input className={f.input} value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(detailCompra.total)} readOnly />
                </div>
              </div>
              <div className={f.field}>
                <label className={f.label}>Observaciones</label>
                <textarea className={f.textarea} value={detailCompra.observaciones ?? ''} readOnly rows={2} />
              </div>
              <div className={s.itemsSection}>
                <label className={f.label}>Partidas</label>
                {detailItems.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No hay ítems registrados</p>
                ) : (
                  <table className={s.itemsTable}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precioUnitario)}</td>
                          <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.cantidad * item.precioUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
          <ModalFooter
            secondary={{ label: 'Cerrar', onClick: () => { setDetailModalOpen(false); setDetailCompra(null); setDetailItems([]); } }}
          />
        </div>
      </Modal>
    </div>
  );
};
