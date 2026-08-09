import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, AlertCircle, CheckCircle, Image as ImageIcon, X, Clock, ChevronRight, List, FileText } from 'lucide-react';
import s from './ReportarDevolucion.module.css';
import { Button } from '@/shared/ui/Button';
import { returnsApi, type Return } from '@/infrastructure/api/returnsApi';
import { catalogApi } from '@/infrastructure/api/catalogApi';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { authApi } from '@/infrastructure/api/authApi';

interface OrderOption {
  id: string;
  numero: string;
  fecha: string;
  estado: string;
}

export const ReportarDevolucion: React.FC = () => {
  const [form, setForm] = useState({
    orderId: '',
    ordenId: '',
    prenda: '',
    referencia: '',
    motivo: '',
    cantidad: '',
    cantidadInspeccionada: '0',
    destino: 'REINGRESO_INVENTARIO' as 'REINGRESO_INVENTARIO' | 'REPARACION' | 'DESCARTE' | 'DEVOLUCION_PROVEEDOR',
    cliente: '',
    responsable: '',
    observaciones: '',
    fechaDevolucion: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [referencias, setReferencias] = useState<{ ref: string; nombre: string }[]>([]);
  const [ordenes, setOrdenes] = useState<OrderOption[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<OrderOption[]>([]);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [myReturns, setMyReturns] = useState<Return[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.list({ limit: 100 }).then(r => {
      const refs = r.data.filter(p => p.ref && p.ref.trim() !== '').map(p => ({ ref: p.ref, nombre: p.nombre })).sort((a, b) => a.ref.localeCompare(b.ref));
      setReferencias(refs);
    });

    const loadClienteData = async () => {
      try {
        const [profile, misPedidos] = await Promise.all([
          authApi.me(),
          ordersApi.me({ limit: 100 }),
        ]);
        const clienteNombre = [profile.nombre, profile.apellidos].filter(Boolean).join(' ').trim();
        setForm(prev => ({ ...prev, cliente: clienteNombre || prev.cliente }));
        const primerPedido = misPedidos.pedidos?.[0];
        if (primerPedido) {
          setForm(prev => ({ ...prev, orderId: primerPedido.numero, ordenId: primerPedido.id }));
        }
        const mapped = (misPedidos.pedidos ?? []).map(p => ({
          id: p.id,
          numero: p.numero,
          fecha: p.fecha,
          estado: p.estado,
        }));
        setOrdenes(mapped);
        setPedidosFiltrados(mapped);
      } catch {
        // Si falla, el usuario puede escribir manualmente
      }
    };

    loadClienteData();
    loadMyReturns();
  }, []);

  const loadMyReturns = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const data = await returnsApi.listClient();
      setMyReturns(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudieron cargar las devoluciones';
      setHistoryError(msg);
      setMyReturns([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const refreshHistory = () => {
    loadMyReturns();
    setActiveTab('history');
  };

  const handleReferenciaChange = (ref: string) => {
    setForm(prev => ({ ...prev, referencia: ref }));
    if (!ref) return;
    const producto = referencias.find(r => r.ref === ref);
    if (producto) setForm(prev => ({ ...prev, prenda: producto.nombre }));
    const matchingOrders = ordenes.filter(o => (o.numero ?? '').includes(ref));
    setPedidosFiltrados(matchingOrders.length > 0 ? matchingOrders : ordenes);
    if (matchingOrders.length === 1) {
      const ordenEncontrada = matchingOrders[0];
      setForm(prev => ({ ...prev, orderId: ordenEncontrada.numero, ordenId: ordenEncontrada.id }));
    } else if (matchingOrders.length === 0 && ordenes.length > 0) {
      const ordenEncontrada = ordenes[0];
      setForm(prev => ({ ...prev, orderId: ordenEncontrada.numero, ordenId: ordenEncontrada.id }));
    }
  };

  const handlePedidoChange = (numero: string) => {
    const orden = ordenes.find(o => o.numero === numero);
    setForm(prev => ({ ...prev, orderId: numero, ordenId: orden?.id ?? prev.ordenId }));
  };

  const MAX_IMAGES = 4;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const validateAndAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageError(null);
    const remaining = MAX_IMAGES - imagenes.length;
    if (remaining <= 0) {
      setImageError(`Máximo ${MAX_IMAGES} imágenes permitidas`);
      return;
    }
    const toProcess = Array.from(files).slice(0, remaining);
    const invalid = toProcess.find(f => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setImageError('Formato no permitido. Usa JPG, PNG, WEBP o GIF');
      return;
    }
    const readers = toProcess.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setImagenes(prev => [...prev, ...results].slice(0, MAX_IMAGES));
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddImages(e.target.files);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await returnsApi.createClient({
        numeroOrden: form.orderId,
        prenda: form.prenda,
        referencia: form.referencia,
        motivo: form.motivo,
        cantidad: Number(form.cantidad),
        cantidadInspeccionada: Number(form.cantidadInspeccionada) || 0,
        destino: form.destino,
        cliente: form.cliente,
        responsable: form.responsable || undefined,
        observaciones: form.observaciones || undefined,
        fechaDevolucion: form.fechaDevolucion,
        imagenes,
      });
      toast.success(`Devolución ${response.numeroDevolucion} reportada correctamente`);
      setForm({
        orderId: form.orderId,
        ordenId: form.ordenId,
        prenda: '',
        referencia: '',
        motivo: '',
        cantidad: '',
        cantidadInspeccionada: '0',
        destino: 'REINGRESO_INVENTARIO',
        cliente: form.cliente,
        responsable: '',
        observaciones: '',
        fechaDevolucion: new Date().toISOString().slice(0, 10),
      });
      setImagenes([]);
      setImageError(null);
    } catch {
      toast.error('No fue posible reportar la devolución');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Devoluciones</h1>
          <p className={s.subtitle}>Reporta una devolución o consulta el estado de tus solicitudes</p>
        </div>
      </div>

      <div className={s.tabs}>
        <button type="button" className={`${s.tab} ${activeTab === 'new' ? s.tabActive : ''}`} onClick={() => setActiveTab('new')}>
          <FileText size={16} />
          <span>Reportar devolución</span>
        </button>
        <button type="button" className={`${s.tab} ${activeTab === 'history' ? s.tabActive : ''}`} onClick={() => { setActiveTab('history'); loadMyReturns(); }}>
          <List size={16} />
          <span>Mis devoluciones</span>
        </button>
      </div>

      {activeTab === 'new' && (
        <div className={s.card}>
          <form onSubmit={handleSubmit} className={s.form}>
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Datos de la devolución</h3>
            <div className={s.grid}>
              <div className={s.field}>
                <label className={s.label}>Referencia *</label>
                <select className={s.input} value={form.referencia} onChange={e => handleReferenciaChange(e.target.value)}>
                  <option value="">Seleccione una referencia</option>
                  {referencias.map(r => <option key={r.ref} value={r.ref}>{r.ref} - {r.nombre}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Prenda *</label>
                <input className={s.input} value={form.prenda} onChange={e => setForm({ ...form, prenda: e.target.value })} required />
              </div>
            </div>
            <div className={s.grid}>
              <div className={s.field}>
                <label className={s.label}>Pedido *</label>
                <select className={s.input} value={form.orderId} onChange={e => handlePedidoChange(e.target.value)}>
                  <option value="">Seleccione un pedido</option>
                  {pedidosFiltrados.map(o => (
                    <option key={o.id} value={o.numero}>
                      {o.numero} - {o.fecha} - {o.estado}
                    </option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Cliente *</label>
                <input className={s.input} value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required readOnly />
              </div>
            </div>
          </div>

          <div className={s.section}>
            <h3 className={s.sectionTitle}>Detalles</h3>
            <div className={s.grid}>
              <div className={s.field}>
                <label className={s.label}>Cantidad *</label>
                <input className={s.input} type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required />
              </div>
              <div className={s.field}>
                <label className={s.label}>Cantidad inspeccionada</label>
                <input className={s.input} type="number" min="0" value={form.cantidadInspeccionada} onChange={e => setForm({ ...form, cantidadInspeccionada: e.target.value })} />
              </div>
            </div>
            <div className={s.grid}>
              <div className={s.field}>
                <label className={s.label}>Motivo</label>
                <input className={s.input} value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Ej: Defecto de confección" />
              </div>
              <div className={s.field}>
                <label className={s.label}>Destino previsto</label>
                <select className={s.input} value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value as any })}>
                  <option value="REINGRESO_INVENTARIO">Reingreso a inventario</option>
                  <option value="REPARACION">Reparación</option>
                  <option value="DESCARTE">Descarte</option>
                  <option value="DEVOLUCION_PROVEEDOR">Devolución a proveedor</option>
                </select>
              </div>
            </div>
            <div className={s.grid}>
              <div className={s.field}>
                <label className={s.label}>Fecha de devolución</label>
                <input className={s.input} type="date" value={form.fechaDevolucion} onChange={e => setForm({ ...form, fechaDevolucion: e.target.value })} />
              </div>
              <div className={s.field}>
                <label className={s.label}>Observaciones</label>
                <textarea className={s.input} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Notas adicionales..." rows={3} />
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Imágenes de soporte (máx. {MAX_IMAGES})</label>
              <div className={s.uploadArea}>
                <input
                  id="return-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageChange}
                  className={s.hiddenInput}
                />
                <label htmlFor="return-images" className={s.uploadLabel}>
                  <ImageIcon size={20} />
                  <span>Seleccionar imágenes</span>
                  <span className={s.uploadHint}>JPG, PNG, WEBP o GIF. Hasta {MAX_IMAGES} archivos.</span>
                </label>
                {imageError && <p className={s.imageError}>{imageError}</p>}
                {imagenes.length > 0 && (
                  <div className={s.imagePreviewGrid}>
                    {imagenes.map((src, idx) => (
                      <div key={idx} className={s.imagePreviewItem}>
                        <img src={src} alt={`preview-${idx}`} />
                        <button type="button" className={s.removeImageBtn} onClick={() => removeImage(idx)} aria-label={`Eliminar imagen ${idx + 1}`}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={s.actions}>
            <Button type="submit" loading={saving} leftIcon={<CheckCircle size={16} />}>Reportar devolución</Button>
          </div>
        </form>
      </div>
      )}

      {activeTab === 'history' && (
        <div className={s.card}>
          <div className={s.sectionHeader}>
            <h3 className={s.sectionTitle}>Historial de mis devoluciones</h3>
            <Button variant="secondary" size="xs" onClick={loadMyReturns} loading={loadingHistory}>Actualizar</Button>
          </div>
          {loadingHistory ? (
            <p className={s.emptyText}>Cargando...</p>
          ) : historyError ? (
            <p className={s.imageError}>{historyError}</p>
          ) : myReturns.length === 0 ? (
            <p className={s.emptyText}>No tienes devoluciones registradas</p>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>N° Devolución</th>
                    <th>Fecha</th>
                    <th>Prenda</th>
                    <th>Referencia</th>
                    <th>Cantidad</th>
                    <th>Destino</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {myReturns.map(ret => (
                    <tr key={ret.id}>
                      <td>{ret.numeroDevolucion}</td>
                      <td>{new Date(ret.fechaDevolucion).toLocaleDateString()}</td>
                      <td>{ret.prenda}</td>
                      <td>{ret.referencia}</td>
                      <td>{ret.cantidad}</td>
                      <td>{DESTINO_TO_UI[ret.destino] ?? ret.destino}</td>
                      <td>
                        <span className={`${s.statusBadge} ${s[`status${ret.estado}`]}`}>
                          {ESTADO_TO_UI[ret.estado] ?? ret.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ESTADO_TO_UI: Record<string, string> = {
  RECIBIDO: 'Recibida',
  EN_INSPECCION: 'En inspección',
  APROBADO: 'Aprobada',
  RECHAZADO: 'Rechazada',
  EN_REPARACION: 'En reparación',
  REINGRESADO: 'Reingresada',
  DESCARTADO: 'Descartada',
};

const DESTINO_TO_UI: Record<string, string> = {
  REINGRESO_INVENTARIO: 'Reingreso a inventario',
  REPARACION: 'Reparación',
  DESCARTE: 'Descarte',
  DEVOLUCION_PROVEEDOR: 'Devolución a proveedor',
};

const TimelineStep: React.FC<{ estado: Return['estado'] }> = ({ estado }) => {
  const steps = [
    { key: 'RECIBIDO', label: 'Recibida' },
    { key: 'EN_INSPECCION', label: 'En inspección' },
    { key: 'APROBADO', label: 'Aprobada' },
    { key: 'EN_REPARACION', label: 'En reparación' },
    { key: 'REINGRESADO', label: 'Finalizada' },
  ];

  const currentIndex = steps.findIndex(s => s.key === estado);

  return (
    <div className={s.timelineTrack}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex || estado === 'REINGRESADO' || estado === 'DESCARTADO';
        const isCurrent = idx === currentIndex && estado !== 'REINGRESADO' && estado !== 'DESCARTADO';
        return (
          <div key={step.key} className={`${s.timelineStep} ${isCompleted ? s.timelineCompleted : ''} ${isCurrent ? s.timelineCurrent : ''}`}>
            <div className={s.timelineDot} />
            <span className={s.timelineLabel}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
