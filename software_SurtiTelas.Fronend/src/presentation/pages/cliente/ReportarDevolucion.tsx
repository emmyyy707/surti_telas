import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import s from './ReportarDevolucion.module.css';
import { Button } from '@/shared/ui/Button';
import { returnsApi } from '@/infrastructure/api/returnsApi';
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
  }, []);

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
          <h1 className={s.title}>Reportar Devolución</h1>
          <p className={s.subtitle}>Completa el formulario para registrar una devolución</p>
        </div>
      </div>

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
          </div>

          <div className={s.actions}>
            <Button type="submit" loading={saving} leftIcon={<CheckCircle size={16} />}>Reportar devolución</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
