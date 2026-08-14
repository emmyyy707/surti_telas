import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Edit3, FileText, CheckCircle, RefreshCcw, Trash2, User, Package, Paintbrush, Image, QrCode, X, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { CustomOrderStatusSelector } from '@/shared/ui/CustomOrderStatusSelector';
import { customOrdersApi, type CustomOrder } from '@/infrastructure/api/customOrdersApi';
import { customersApi } from '@/infrastructure/api/customersApi';
import { catalogApi } from '@/infrastructure/api/catalogApi';
import { CustomOrderFormModal } from '@/presentation/components/CustomOrderFormModal';
import s from './PedidosPersonalizados.module.css';

const CUSTOM_ORDER_STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  SOLICITUD_RECIBIDA: 'info',
  EN_REVISION: 'warning',
  COTIZADO: 'success',
  COTIZACION_ACEPTADA: 'success',
  COTIZACION_RECHAZADA: 'danger',
  PAGO_PENDIENTE: 'warning',
  PAGO_EN_VERIFICACION: 'info',
  PAGO_APROBADO: 'success',
  CONVERTIDO_A_PEDIDO: 'default',
  EN_PRODUCCION: 'info',
  COMPLETADO: 'success',
  CANCELADO: 'danger',
  VENCIDO: 'danger',
};

type FormState = {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  usoFinal: string;
  tipoPrenda: string;
  tecnicaPersonalizacion: string;
  tallas: string;
  coloresSolicitados: string;
  cantidadTotal: number;
  fechaEntregaDeseada: string;
  notasCliente: string;
  notasReferencia: string;
  items: { descripcion: string; tipoPersonalizacion: string; especificaciones: string; cantidad: string; talla: string; color: string; material: string; ubicacion: string[]; personalizaciones: { tipo: string; tecnica: string; ubicacion: string[]; descripcion: string; variantes: { talla: string; color: string; cantidad: number }[] }[] }[];
};

type WizardData = {
  distribucionTallas?: Record<string, number>;
  distribucionColores?: Record<number, number>;
  distribucionColoresList?: string[];
  tecnica?: string;
  tamano?: string;
  cantidadDisenos?: number;
  numeroColores?: number;
  usoFinal?: string;
};

const toUbicacionArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') return value.split(',').map((u) => u.trim()).filter(Boolean);
  return [];
};

type QuotationLine = {
  id: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  observaciones?: string;
};

const emptyForm: FormState = {
  clienteNombre: '',
  clienteEmail: '',
  clienteTelefono: '',
  usoFinal: '',
  tipoPrenda: '',
  tecnicaPersonalizacion: '',
  tallas: '',
  coloresSolicitados: '',
  cantidadTotal: 1,
  fechaEntregaDeseada: '',
  notasCliente: '',
  notasReferencia: '',
  items: [{ descripcion: '', tipoPersonalizacion: 'BORDADO_ESTAMPADO', especificaciones: '', cantidad: '1', talla: '', color: '', material: '', ubicacion: [], personalizaciones: [] }],
};

export const AdminPedidosPersonalizados: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const [statusConfirm, setStatusConfirm] = useState<CustomOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CustomOrder['estado'] | null>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<CustomOrder | null>(null);

  const [quotationOpen, setQuotationOpen] = useState(false);
  const [quotationLines, setQuotationLines] = useState<QuotationLine[]>([]);
  const [quotationDiscount, setQuotationDiscount] = useState(0);
  const [quotationTaxRate, setQuotationTaxRate] = useState(19);
  const [quotationAdvanceRate, setQuotationAdvanceRate] = useState(50);
  const [quotationNotes, setQuotationNotes] = useState('');
  const [quotationDeliveryDays, setQuotationDeliveryDays] = useState(7);
  const [quotationPaymentTerms, setQuotationPaymentTerms] = useState('50% anticipo, 50% contra entrega');
  const [quotationSaving, setQuotationSaving] = useState(false);

  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  const [clientes, setClientes] = useState<{ id: string; nombre: string; email?: string; telefono?: string }[]>([]);
  const [productos, setProductos] = useState<{ id: string; nombre: string; tela?: string; colores?: string[]; tallas?: string[] }[]>([]);
  const [, setLoadingCatalog] = useState(false);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.estado === 'SOLICITUD_RECIBIDA' || o.estado === 'EN_REVISION').length;
  const quotedOrders = orders.filter(o => o.estado === 'COTIZADO' || o.estado === 'COTIZACION_ACEPTADA').length;
  const productionOrders = orders.filter(o => o.estado === 'EN_PRODUCCION').length;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await customOrdersApi.list({ page, limit: pageSize, search: search || undefined });
      setOrders(result.items ?? []);
      setTotalPages(result.totalPages ?? 1);
      setTotalItems(result.totalRecords ?? 0);
    } catch {
      toast.error('Error al cargar pedidos personalizados');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!formOpen) return;
    let cancelled = false;
    (async () => {
      setLoadingCatalog(true);
      try {
        const [clientesRes, productosRes] = await Promise.all([
          customersApi.list({ limit: 100 }),
          catalogApi.list({ limit: 100 }),
        ]);
        if (!cancelled) {
          setClientes((clientesRes.data ?? []).map(c => ({ id: c.id ?? '', nombre: c.nombre, email: c.email, telefono: c.tel ?? '' })));
          setProductos((productosRes.data ?? []).map(p => ({ id: p.id ?? '', nombre: p.nombre, tela: p.tela, colores: p.colores, tallas: p.tallas })));
        }
      } catch {
        if (!cancelled) {
          setClientes([]);
          setProductos([]);
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => { cancelled = true };
  }, [formOpen]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setSelectedFiles([]);
    setFileUrls([]);
    setWizardStep(1);
    setWizardData({});
    setActiveItemIndex(0);
    setFormOpen(true);
  };

  const openEdit = (order: CustomOrder) => {
    setEditingId(order.id);
    setForm({
      clienteNombre: order.clienteNombre,
      clienteEmail: order.clienteEmail ?? '',
      clienteTelefono: order.clienteTelefono ?? '',
      usoFinal: order.usoFinal ?? '',
      tipoPrenda: '',
      tecnicaPersonalizacion: '',
      tallas: '',
      coloresSolicitados: '',
      cantidadTotal: order.items[0]?.cantidad ?? 1,
      fechaEntregaDeseada: order.fechaEntregaDeseada ? new Date(order.fechaEntregaDeseada).toISOString().slice(0, 10) : '',
      notasCliente: order.notasCliente ?? '',
      notasReferencia: order.notasReferencia ?? '',
      items: order.items.map((item) => ({
        descripcion: item.descripcion,
        tipoPersonalizacion: item.tipoPersonalizacion,
        especificaciones: item.especificaciones ?? '',
        cantidad: String(item.cantidad),
        talla: item.talla ?? '',
        color: item.color ?? '',
        material: item.material ?? '',
        ubicacion: toUbicacionArray(item.ubicacion),
        personalizaciones: (item.personalizaciones || []).map((pers: any) => ({
          tipo: pers.tipo,
          tecnica: pers.tecnica ?? '',
          ubicacion: toUbicacionArray(pers.ubicacion),
          descripcion: pers.descripcion,
          variantes: (pers.variantes || []).map((v: any) => ({
            talla: v.talla,
            color: v.color,
            cantidad: Number(v.cantidad),
          })),
        })),
      })),
    });
    setErrors({});
    setTouched({});
    setSelectedFiles([]);
    setFileUrls([]);
    setWizardStep(1);
    setWizardData({});
    setActiveItemIndex(0);
    setFormOpen(true);
  };

  const agregarPersonalizacion = () => {
    const items = [...form.items];
    const current = items[activeItemIndex]?.personalizaciones || [];
    items[activeItemIndex] = {
      ...items[activeItemIndex],
      personalizaciones: [
        ...current,
        { tipo: 'ESTAMPADO', tecnica: '', ubicacion: [], descripcion: '', variantes: [] },
      ],
    };
    setForm({ ...form, items });
  };

  const eliminarPersonalizacion = (persIndex: number) => {
    const items = [...form.items];
    items[activeItemIndex] = {
      ...items[activeItemIndex],
      personalizaciones: (items[activeItemIndex]?.personalizaciones || []).filter((_, i) => i !== persIndex),
    };
    setForm({ ...form, items });
  };

  const actualizarPersonalizacion = (persIndex: number, field: string, value: any) => {
    const items = [...form.items];
    const pers = [...(items[activeItemIndex]?.personalizaciones || [])];
    pers[persIndex] = { ...pers[persIndex], [field]: value };
    items[activeItemIndex] = { ...items[activeItemIndex], personalizaciones: pers };
    setForm({ ...form, items });
  };

  const agregarVariante = (persIndex: number) => {
    const items = [...form.items];
    const pers = [...(items[activeItemIndex]?.personalizaciones || [])];
    pers[persIndex] = {
      ...pers[persIndex],
      variantes: [...(pers[persIndex]?.variantes || []), { talla: '', color: '', cantidad: 1 }],
    };
    items[activeItemIndex] = { ...items[activeItemIndex], personalizaciones: pers };
    setForm({ ...form, items });
  };

  const eliminarVariante = (persIndex: number, varIndex: number) => {
    const items = [...form.items];
    const pers = [...(items[activeItemIndex]?.personalizaciones || [])];
    pers[persIndex] = {
      ...pers[persIndex],
      variantes: (pers[persIndex]?.variantes || []).filter((_, i) => i !== varIndex),
    };
    items[activeItemIndex] = { ...items[activeItemIndex], personalizaciones: pers };
    setForm({ ...form, items });
  };

  const actualizarVariante = (persIndex: number, varIndex: number, field: string, value: any) => {
    const items = [...form.items];
    const pers = [...(items[activeItemIndex]?.personalizaciones || [])];
    const variantes = [...(pers[persIndex]?.variantes || [])];
    variantes[varIndex] = { ...variantes[varIndex], [field]: value };
    pers[persIndex] = { ...pers[persIndex], variantes };
    items[activeItemIndex] = { ...items[activeItemIndex], personalizaciones: pers };
    setForm({ ...form, items });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!(form.clienteNombre || '').trim()) next.clienteNombre = 'Selecciona un cliente';
    const hasInvalidItem = form.items.some((item, idx) => {
      if (!(item.descripcion || '').trim()) next[`items.${idx}.descripcion`] = 'La descripción es obligatoria';
      if (!item.tipoPersonalizacion) next[`items.${idx}.tipoPersonalizacion`] = 'Selecciona el tipo de personalización';
      if (!item.cantidad || Number(item.cantidad) <= 0) next[`items.${idx}.cantidad`] = 'Ingresa una cantidad válida';
      (item.personalizaciones || []).forEach((pers, pIdx) => {
        if (!pers.tipo) next[`items.${idx}.personalizaciones.${pIdx}.tipo`] = 'Selecciona el tipo';
        if (!pers.descripcion?.trim()) next[`items.${idx}.personalizaciones.${pIdx}.descripcion`] = 'La descripción es obligatoria';
      });
      return false;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    const touchedFields: Record<string, boolean> = { clienteNombre: true };
    form.items.forEach((_, idx) => {
      touchedFields[`items.${idx}.descripcion`] = true;
      touchedFields[`items.${idx}.tipoPersonalizacion`] = true;
      touchedFields[`items.${idx}.cantidad`] = true;
    });
    setTouched(touchedFields);
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        clienteNombre: form.clienteNombre,
        clienteEmail: form.clienteEmail || undefined,
        clienteTelefono: form.clienteTelefono || undefined,
        notasReferencia: form.notasReferencia || undefined,
        descripcionGeneral: form.items[0]?.descripcion || undefined,
        usoFinal: wizardData.usoFinal || form.usoFinal || undefined,
        tipoPrenda: form.tipoPrenda || undefined,
        tecnicaPersonalizacion: form.tecnicaPersonalizacion || undefined,
        tallas: form.tallas ? form.tallas.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        coloresSolicitados: form.coloresSolicitados ? form.coloresSolicitados.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        cantidadTotal: form.cantidadTotal || form.items[0]?.cantidad || 1,
        fechaEntregaDeseada: form.fechaEntregaDeseada || undefined,
        notasCliente: form.notasCliente || undefined,
        items: form.items.map((item, index) => ({
            descripcion: item.descripcion,
            tipoPersonalizacion: item.tipoPersonalizacion,
            especificaciones: item.especificaciones || undefined,
            cantidad: Number(item.cantidad),
            talla: item.talla || undefined,
            color: item.color || undefined,
            material: item.material || undefined,
            ubicacion: item.ubicacion || undefined,
            distribucionTallas: wizardData.distribucionTallas || undefined,
            distribucionColores: wizardData.distribucionColoresList ? wizardData.distribucionColoresList.reduce((acc, color, idx) => { if (color) acc[color] = wizardData.distribucionColores?.[idx] || 0; return acc; }, {} as Record<string, number>) : undefined,
            orden: index,
            personalizaciones: (item.personalizaciones || [])
              .filter((pers) => !!pers.tipo && !!pers.descripcion?.trim())
              .map((pers, pIndex) => ({
                tipo: pers.tipo,
                tecnica: pers.tecnica || undefined,
                ubicacion: pers.ubicacion || undefined,
                descripcion: pers.descripcion,
                archivos: [],
                orden: pIndex,
                variantes: (pers.variantes || [])
                  .filter((v) => Number(v.cantidad) > 0)
                  .map((v) => ({
                    talla: v.talla,
                    color: v.color,
                    cantidad: Number(v.cantidad),
                  })),
              })),
          })),
      };

      if (editingId) {
        await customOrdersApi.update(editingId, payload);
        toast.success('Pedido actualizado');
      } else {
        await customOrdersApi.create(payload);
        toast.success('Pedido creado');
      }
      setFormOpen(false);
      void loadOrders();
    } catch {
      toast.error('Error al guardar pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
    setFileUrls(files.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateStep = (step: number): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!(form.clienteNombre || '').trim()) next.clienteNombre = 'Selecciona un cliente';
    }
    if (step === 2) {
      const item = form.items[activeItemIndex];
      if (!(item?.descripcion || '').trim()) next[`items.${activeItemIndex}.descripcion`] = 'Selecciona un producto';
      if (!item?.cantidad || Number(item.cantidad) <= 0) next[`items.${activeItemIndex}.cantidad`] = 'Ingresa una cantidad válida';
      if (!item?.tipoPersonalizacion) next[`items.${activeItemIndex}.tipoPersonalizacion`] = 'Selecciona el tipo de personalización';
      if (wizardData.distribucionTallas && Object.keys(wizardData.distribucionTallas).length > 0) {
        const suma = Object.values(wizardData.distribucionTallas).reduce((acc: number, val) => acc + Number(val || 0), 0);
        if (suma !== Number(item?.cantidad || 0)) {
          next['distribucionTallas'] = `La distribución de tallas (${suma}) no coincide con la cantidad total (${item?.cantidad || 0})`;
        }
      }
      if (wizardData.distribucionColores && Object.keys(wizardData.distribucionColores).length > 0) {
        const suma = Object.values(wizardData.distribucionColores).reduce((acc: number, val) => acc + Number(val || 0), 0);
        if (suma !== Number(item?.cantidad || 0)) {
          next['distribucionColores'] = `La distribución de colores (${suma}) no coincide con la cantidad total (${item?.cantidad || 0})`;
        }
      }
    }
    setErrors(next);
    const touchedFields: Record<string, boolean> = { clienteNombre: true };
    form.items.forEach((_, idx) => {
      touchedFields[`items.${idx}.descripcion`] = true;
      touchedFields[`items.${idx}.tipoPersonalizacion`] = true;
      touchedFields[`items.${idx}.cantidad`] = true;
    });
    setTouched(touchedFields);
    return Object.keys(next).length === 0;
  };

  const handleChangeStatus = async () => {
    if (!statusConfirm || !selectedStatus) return;
    try {
      await customOrdersApi.updateStatus(statusConfirm.id, selectedStatus);
      await loadOrders();
      toast.success(`Solicitud ${statusConfirm.numeroSolicitud} actualizada a ${getStatusLabel(selectedStatus)}`);
      setStatusConfirm(null);
      setSelectedStatus(null);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const openQuotationEditor = (order: CustomOrder) => {
    const existingLines: QuotationLine[] = order.cotizacion?.detalles?.map((d, idx) => ({
      id: d.id ?? `line-${idx}`,
      tipo: d.tipo,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      unidadMedida: d.unidadMedida ?? 'unidad',
      precioUnitario: Number(d.precioUnitario),
      observaciones: d.observaciones ?? '',
    })) ?? [];
    
    if (existingLines.length === 0 && order.items.length > 0) {
      order.items.forEach((item, idx) => {
        existingLines.push({
          id: `line-${Date.now()}-${idx}-producto`,
          tipo: 'PRODUCTO_BASE',
          descripcion: item.descripcion || `Producto ${idx + 1}`,
          cantidad: Number(item.cantidad) || 1,
          unidadMedida: 'unidad',
          precioUnitario: 0,
          observaciones: '',
        });
        existingLines.push({
          id: `line-${Date.now()}-${idx}-personalizacion`,
          tipo: 'MANO_OBRA',
          descripcion: (item.tipoPersonalizacion || 'Personalización').replace(/_/g, ' '),
          cantidad: Number(item.cantidad) || 1,
          unidadMedida: 'unidad',
          precioUnitario: 0,
          observaciones: Array.isArray(item.ubicacion) ? item.ubicacion.join(', ') : (item.ubicacion ?? ''),
        });
      });
    } else if (existingLines.length === 0) {
      existingLines.push({
        id: `line-${Date.now()}`,
        tipo: 'PRODUCTO_BASE',
        descripcion: order.items[0]?.descripcion ?? 'Producto personalizado',
        cantidad: order.items[0]?.cantidad ?? 1,
        unidadMedida: 'unidad',
        precioUnitario: 0,
        observaciones: '',
      });
    }

    setQuotationLines(existingLines);
    setQuotationDiscount(order.cotizacion?.descuento ? Number(order.cotizacion.descuento) : 0);
    setQuotationTaxRate(19);
    setQuotationAdvanceRate(50);
    setQuotationNotes(order.cotizacion?.observaciones ?? '');
    setQuotationDeliveryDays(order.cotizacion?.tiempoEstimadoDias ?? 7);
    setQuotationPaymentTerms(order.cotizacion?.condicionesPago ?? '50% anticipo, 50% contra entrega');
    setQuotationSaving(false);
    setSelectedOrder(order);
    setQuotationOpen(true);
  };

  const addQuotationLine = () => {
    setQuotationLines(prev => [...prev, {
      id: `line-${Date.now()}`,
      tipo: 'OTRO',
      descripcion: '',
      cantidad: 1,
      unidadMedida: 'unidad',
      precioUnitario: 0,
      observaciones: '',
    }]);
  };

  const removeQuotationLine = (id: string) => {
    setQuotationLines(prev => prev.filter(line => line.id !== id));
  };

  const updateQuotationLine = (id: string, field: keyof QuotationLine, value: string | number) => {
    setQuotationLines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const updated = { ...line, [field]: value };
      if (field === 'cantidad' || field === 'precioUnitario') {
        updated.precioUnitario = Number(updated.precioUnitario);
        updated.cantidad = Number(updated.cantidad);
      }
      return updated;
    }));
  };

  const handleSaveQuotation = async () => {
    if (!selectedOrder) return;
    setQuotationSaving(true);
    try {
      const payload = {
        detalles: quotationLines.map((line, index) => ({
          tipo: line.tipo,
          descripcion: line.descripcion,
          cantidad: Number(line.cantidad),
          unidadMedida: line.unidadMedida,
          precioUnitario: Number(line.precioUnitario),
          subtotal: calcLineSubtotal(line),
          observaciones: line.observaciones,
          orden: index,
        })),
        subtotal: Number(calcQuotation.subtotal),
        impuestos: Number(calcQuotation.taxes),
        descuento: Number(calcQuotation.discount),
        tiempoEstimadoDias: Number(quotationDeliveryDays),
        validaHasta: new Date(Date.now() + quotationDeliveryDays * 24 * 60 * 60 * 1000).toISOString(),
        condicionesPago: quotationPaymentTerms,
        observaciones: quotationNotes,
        generadoPorId: 'admin',
        generadoPorNombre: 'Administrador',
      };

      await customOrdersApi.generateQuotation(selectedOrder.id, payload);
      toast.success('Cotización generada y enviada al cliente');
      setQuotationOpen(false);
      void loadOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al generar cotización';
      if (message.includes('Ya existe una cotización') || message.includes('409')) {
        toast.error('Este pedido ya tiene una cotización. Consulta o edita la cotización existente.');
      } else {
        toast.error(message || 'Error al generar cotización');
      }
    } finally {
      setQuotationSaving(false);
    }
  };

  const columns = [
    { 
      key: 'numeroSolicitud', 
      header: 'Solicitud',
      render: (row: CustomOrder) => (
        <span className={s.tdMono + ' ' + s.tdPrimary}>{row.numeroSolicitud}</span>
      )
    },
    { 
      key: 'clienteNombre', 
      header: 'Cliente',
      render: (row: CustomOrder) => (
        <span className={s.tdPrimary}>{row.clienteNombre}</span>
      )
    },
    { key: 'estado', header: 'Estado', render: (row: CustomOrder) => (
      <Badge variant={CUSTOM_ORDER_STATUS_COLORS[row.estado] ?? 'default'}>{getStatusLabel(row.estado)}</Badge>
    )},
  ];

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      SOLICITUD_RECIBIDA: 'Solicitud recibida',
      EN_REVISION: 'En revisión',
      COTIZADO: 'Cotizado',
      COTIZACION_ACEPTADA: 'Cotización aceptada',
      COTIZACION_RECHAZADA: 'Cotización rechazada',
      PAGO_PENDIENTE: 'Pago pendiente',
      PAGO_EN_VERIFICACION: 'Pago en verificación',
      PAGO_APROBADO: 'Pago aprobado',
      CONVERTIDO_A_PEDIDO: 'Convertido a pedido',
      EN_PRODUCCION: 'En producción',
      COMPLETADO: 'Completado',
      CANCELADO: 'Cancelado',
      VENCIDO: 'Vencido',
    };
    return labels[estado] ?? estado;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const calcLineSubtotal = (line: QuotationLine) => Number((line.cantidad * line.precioUnitario).toFixed(2));

  const calcQuotation = useMemo(() => {
    const subtotal = Number(quotationLines.reduce((sum, line) => sum + calcLineSubtotal(line), 0).toFixed(2));
    const discount = Number(Math.min(quotationDiscount, subtotal).toFixed(2));
    const base = subtotal - discount;
    const taxes = Number((base * (quotationTaxRate / 100)).toFixed(2));
    const total = Number((base + taxes).toFixed(2));
    const advance = Number((total * (quotationAdvanceRate / 100)).toFixed(2));
    const balance = Number((total - advance).toFixed(2));
    return { subtotal, discount, base, taxes, total, advance, balance };
  }, [quotationLines, quotationDiscount, quotationTaxRate, quotationAdvanceRate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => o.numeroSolicitud.toLowerCase().includes(q) || o.clienteNombre.toLowerCase().includes(q));
  }, [orders, search]);

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Pedidos Personalizados</h1>
          <p className={s.pageSubtitle}>Gestiona solicitudes, cotizaciones y conversión a pedidos</p>
        </div>
        <Button onClick={openCreate} className="inline-flex items-center gap-2">
          <Plus size={18} />
          <span>Nuevo pedido</span>
        </Button>
      </div>

      <div className={s.metricsRow}>
        <div className={`${s.metricCard} ${s.metricCardPrimary}`}>
          <span className={`${s.metricIcon} ${s.metricIconPending}`}>
            <FileText size={24} />
          </span>
          <div className={s.metricBody}>
            <span className={s.metricValue}>{totalOrders}</span>
            <span className={s.metricLabel}>Total</span>
          </div>
        </div>
        <div className={`${s.metricCard} ${s.metricCardWarning}`}>
          <span className={`${s.metricIcon} ${s.metricIconWarning}`}>
            <Eye size={24} />
          </span>
          <div className={s.metricBody}>
            <span className={s.metricValue}>{pendingOrders}</span>
            <span className={s.metricLabel}>Pendientes</span>
          </div>
        </div>
        <div className={`${s.metricCard} ${s.metricCardSuccess}`}>
          <span className={`${s.metricIcon} ${s.metricIconDone}`}>
            <CheckCircle size={24} />
          </span>
          <div className={s.metricBody}>
            <span className={s.metricValue}>{quotedOrders}</span>
            <span className={s.metricLabel}>Cotizados</span>
          </div>
        </div>
        <div className={`${s.metricCard} ${s.metricCardPrimary}`}>
          <span className={`${s.metricIcon} ${s.metricIconReceived}`}>
            <RefreshCcw size={24} />
          </span>
          <div className={s.metricBody}>
            <span className={s.metricValue}>{productionOrders}</span>
            <span className={s.metricLabel}>En producción</span>
          </div>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <div className={s.filters}>
          <div className={s.searchBox}>
            <span className={s.searchIcon}>
              <Eye size={16} />
            </span>
            <input
              className={s.searchInput}
              placeholder="Buscar por solicitud o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={loadOrders} disabled={loading} variant="secondary">
            <RefreshCcw size={16} className="mr-2" />
            Actualizar
          </Button>
        </div>

        <div className={s.tableWrapper}>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage={loading ? 'Cargando...' : 'No hay pedidos personalizados'}
            enableRowSelection={false}
            maxVisibleColumns={10}
            serverMode
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            actions={(row) => [
              { label: 'Ver detalle', icon: <Eye size={14} />, onClick: () => { setSelectedOrder(row); setDetailOpen(true); } },
              { label: 'Editar', icon: <Edit3 size={14} />, onClick: () => openEdit(row) },
              { label: 'Cambiar estado', onClick: () => { setStatusConfirm(row); setSelectedStatus(null); } },
              ...(!row.anticipoPagado && (row.paymentKey || row.paymentProofUrl) ? [{ label: 'Confirmar pago', onClick: () => setPaymentConfirm(row) }] : []),
              { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => {
                if (window.confirm('¿Eliminar este pedido?')) {
                  customOrdersApi.remove(row.id).then(() => {
                    toast.success('Pedido eliminado');
                    void loadOrders();
                  }).catch(() => toast.error('Error al eliminar'));
                }
              }, danger: true },
            ]}
          />
        </div>
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Solicitud ${selectedOrder?.numeroSolicitud ?? ''}`}
        footer={
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            {selectedOrder && (selectedOrder.estado === 'EN_REVISION' || selectedOrder.estado === 'COTIZADO') && (
              <Button onClick={() => openQuotationEditor(selectedOrder)}>
                {selectedOrder.cotizacion ? 'Editar cotización' : 'Generar cotización'}
              </Button>
            )}
            {selectedOrder && selectedOrder.estado === 'PAGO_PENDIENTE' && !selectedOrder.anticipoPagado && (
              <Button onClick={() => { setPaymentConfirm(selectedOrder); setDetailOpen(false); }}>
                Confirmar anticipo
              </Button>
            )}
            {selectedOrder && selectedOrder.estado === 'PAGO_APROBADO' && (
              <Button onClick={async () => {
                try {
                  await customOrdersApi.convertToOrder(selectedOrder.id);
                  toast.success('Pedido convertido exitosamente');
                  setDetailOpen(false);
                  void loadOrders();
                } catch {
                  toast.error('Error al convertir a pedido');
                }
              }}>
                Convertir a pedido
              </Button>
            )}
            {selectedOrder && !selectedOrder.anticipoPagado && (selectedOrder.paymentKey || selectedOrder.paymentProofUrl) && selectedOrder.estado !== 'COTIZACION_ACEPTADA' && (
              <Button onClick={() => { setPaymentConfirm(selectedOrder); setDetailOpen(false); }}>Confirmar anticipo</Button>
            )}
          </div>
        }
      >
        {selectedOrder && (
          <div className={s.form}>
            <div className={s.formRow}>
              <div className={s.field}>
                <span className={s.label}>Cliente</span>
                <span className={s.infoValue}>{selectedOrder.clienteNombre}</span>
              </div>
              <div className={s.field}>
                <span className={s.label}>Estado</span>
                <Badge variant={CUSTOM_ORDER_STATUS_COLORS[selectedOrder.estado] ?? 'default'}>{getStatusLabel(selectedOrder.estado)}</Badge>
              </div>
              <div className={s.field}>
                <span className={s.label}>Email</span>
                <span className={s.infoValue}>{selectedOrder.clienteEmail ?? '-'}</span>
              </div>
              <div className={s.field}>
                <span className={s.label}>Teléfono</span>
                <span className={s.infoValue}>{selectedOrder.clienteTelefono ?? '-'}</span>
              </div>
              <div className={s.field}>
                <span className={s.label}>Uso final</span>
                <span className={s.infoValue}>{selectedOrder.usoFinal ?? '-'}</span>
              </div>
              <div className={s.field}>
                <span className={s.label}>Fecha límite</span>
                <span className={s.infoValue}>{selectedOrder.fechaEntregaDeseada ? new Date(selectedOrder.fechaEntregaDeseada).toLocaleDateString('es-CO') : '-'}</span>
              </div>
            </div>

            {selectedOrder.cotizacion && (
              <div className={s.registroInfo}>
                <span className={s.label} style={{ marginBottom: '12px', display: 'block' }}>Cotización</span>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <span className={s.label}>Número</span>
                    <span className={s.infoValue}>{selectedOrder.cotizacion.numeroCotizacion}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Estado</span>
                    <Badge variant={selectedOrder.cotizacion.estado === 'ACEPTADA' ? 'success' : selectedOrder.cotizacion.estado === 'RECHAZADA' ? 'danger' : 'info'}>{selectedOrder.cotizacion.estado}</Badge>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Válida hasta</span>
                    <span className={s.infoValue}>{selectedOrder.cotizacion.validaHasta ? new Date(selectedOrder.cotizacion.validaHasta).toLocaleDateString('es-CO') : '-'}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Condiciones</span>
                    <span className={s.infoValue}>{selectedOrder.cotizacion.condicionesPago ?? '-'}</span>
                  </div>
                </div>

                {selectedOrder.cotizacion.detalles?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <span className={s.label} style={{ marginBottom: '8px', display: 'block' }}>Desglose</span>
                    <div className={s.quotationTable}>
                      <div className={s.quotationHeader}>
                        <span className={s.quotationColDesc}>Concepto</span>
                        <span className={s.quotationColCant}>Cant.</span>
                        <span className={s.quotationColUnit}>P. unitario</span>
                        <span className={s.quotationColSub}>Subtotal</span>
                      </div>
                      {selectedOrder.cotizacion.detalles.map((detalle) => (
                        <div key={detalle.id} className={s.quotationRow}>
                          <div className={`${s.quotationColDesc} ${s.colSpan2}`}>
                            <span className={s.infoValue}>{detalle.descripcion}</span>
                            <span className={s.infoLabel} style={{ marginLeft: '8px' }}>{detalle.tipo.replace(/_/g, ' ')}</span>
                          </div>
                          <div className={s.quotationColCant}>
                            <span className={s.infoValue}>{detalle.cantidad}</span>
                          </div>
                          <div className={s.quotationColUnit}>
                            <span className={s.infoValue}>{formatCurrency(Number(detalle.precioUnitario))}</span>
                          </div>
                          <div className={s.quotationColSub}>
                            <span className={s.infoValue}>{formatCurrency(Number(detalle.subtotal))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={s.quotationSummary} style={{ marginTop: '12px' }}>
                      <div className={s.quotationSummaryRow}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(Number(selectedOrder.cotizacion.subtotal))}</span>
                      </div>
                      <div className={s.quotationSummaryRow}>
                        <span>Descuento</span>
                        <span>{formatCurrency(Number(selectedOrder.cotizacion.descuento))}</span>
                      </div>
                      <div className={s.quotationSummaryRow}>
                        <span>Impuestos</span>
                        <span>{formatCurrency(Number(selectedOrder.cotizacion.impuestos))}</span>
                      </div>
                      <div className={`${s.quotationSummaryRow} ${s.quotationSummaryTotal}`}>
                        <span>Total</span>
                        <span>{formatCurrency(Number(selectedOrder.cotizacion.total))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedOrder.items.length > 0 && (
              <div>
                <span className={s.label} style={{ marginBottom: '10px', display: 'block' }}>Productos</span>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={item.id} className={s.registroInfo} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <span className={s.infoValue} style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Producto #{idx + 1}: {item.descripcion || 'Sin nombre'}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <span className={s.infoLabel}>Tipo: {(item.tipoPersonalizacion || '').replace(/_/g, ' ')}</span>
                            <span className={s.infoLabel}>Cantidad: {item.cantidad}</span>
                            {item.talla && <span className={s.infoLabel}>Talla: {item.talla}</span>}
                            {item.color && <span className={s.infoLabel}>Color: {item.color}</span>}
                            {item.material && <span className={s.infoLabel}>Material: {item.material}</span>}
                            {item.especificaciones && <span className={s.infoLabel}>Especificaciones: {item.especificaciones}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedOrder.paymentKey || selectedOrder.paymentProofUrl) && (
              <div className={s.registroInfo}>
                <span className={s.label} style={{ marginBottom: '10px', display: 'block' }}>Pago</span>
                <div className={s.formRow}>
                  {selectedOrder.paymentKey && (
                    <div className={s.field}>
                      <span className={s.label}>Llave de pago</span>
                      <span className={s.infoValue}>{selectedOrder.paymentKey}</span>
                    </div>
                  )}
                  {selectedOrder.paymentProofUrl && (
                    <div className={s.field}>
                      <span className={s.label}>Comprobante</span>
                      <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noreferrer" className={s.fileLink}>
                        Ver comprobante
                      </a>
                    </div>
                  )}
                </div>
                <div className={s.field}>
                  <span className={s.label}>Estado del pago</span>
                  <Badge variant={selectedOrder.anticipoPagado ? 'success' : 'warning'}>
                    {selectedOrder.anticipoPagado ? 'Anticipo confirmado' : selectedOrder.paymentStatus === 'PENDING' ? 'Pendiente de revisión' : 'Sin comprobante'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!quotationOpen} onClose={() => setQuotationOpen(false)} title="Editor de Cotización" description="Construye la cotización con conceptos, precios y condiciones." size="xl">
        {selectedOrder && (
          <div className={s.form}>
            <div className={s.sectionBlock}>
              <div className={s.sectionHeader}>
                <FileText size={18} />
                <div className={s.sectionTitle}>Conceptos de la cotización</div>
              </div>
              <p className={s.sectionDescription}>Agrega los conceptos que componen el precio del pedido personalizado.</p>
              
              <div className={s.quotationTable}>
                <div className={s.quotationHeader}>
                  <span className={s.quotationColType}>Tipo</span>
                  <span className={s.quotationColDesc}>Descripción</span>
                  <span className={s.quotationColCant}>Cantidad</span>
                  <span className={s.quotationColUnit}>Precio unitario</span>
                  <span className={s.quotationColSub}>Subtotal</span>
                  <span className={s.quotationColActions}></span>
                </div>
                {quotationLines.map((line) => (
                  <div key={line.id} className={s.quotationRow}>
                    <div className={s.quotationColType}>
                      <select className={s.select} value={line.tipo} onChange={(e) => updateQuotationLine(line.id, 'tipo', e.target.value)}>
                        <option value="PRODUCTO_BASE">Producto base</option>
                        <option value="MATERIA_PRIMA">Materia prima</option>
                        <option value="MANO_OBRA">Mano de obra</option>
                        <option value="DISENO">Diseño</option>
                        <option value="LOGISTICA">Logística</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div className={s.quotationColDesc}>
                      <input className={s.input} placeholder="Concepto" value={line.descripcion} onChange={(e) => updateQuotationLine(line.id, 'descripcion', e.target.value)} />
                    </div>
                    <div className={s.quotationColCant}>
                      <input className={s.input} type="number" min="1" value={line.cantidad} onChange={(e) => updateQuotationLine(line.id, 'cantidad', e.target.value)} />
                    </div>
                    <div className={s.quotationColUnit}>
                      <input className={s.input} type="number" min="0" step="1" value={line.precioUnitario} onChange={(e) => updateQuotationLine(line.id, 'precioUnitario', Number(e.target.value))} />
                    </div>
                    <div className={s.quotationColSub}>
                      <span className={s.quotationSubtotal}>{formatCurrency(calcLineSubtotal(line))}</span>
                    </div>
                    <div className={s.quotationColActions}>
                      <button type="button" className={s.removeFileBtn} onClick={() => removeQuotationLine(line.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className={s.quotationAddLine} onClick={addQuotationLine}>
                  <PlusCircle size={16} />
                  <span>Agregar concepto</span>
                </button>
              </div>
            </div>

            <div className={s.sectionBlock}>
              <div className={s.sectionHeader}>
                <FileText size={18} />
                <div className={s.sectionTitle}>Resumen</div>
              </div>
              <div className={s.quotationSummary}>
                <div className={s.quotationSummaryRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(calcQuotation.subtotal)}</span>
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Descuento</span>
                  <input className={s.quotationInput} type="number" min="0" value={quotationDiscount} onChange={(e) => setQuotationDiscount(Number(e.target.value))} />
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Base gravable</span>
                  <span>{formatCurrency(calcQuotation.base)}</span>
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Impuestos ({quotationTaxRate}%)</span>
                  <input className={s.quotationInput} type="number" min="0" max="100" value={quotationTaxRate} onChange={(e) => setQuotationTaxRate(Number(e.target.value))} />
                </div>
                <div className={`${s.quotationSummaryRow} ${s.quotationSummaryTotal}`}>
                  <span>Total</span>
                  <span>{formatCurrency(calcQuotation.total)}</span>
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Anticipo ({quotationAdvanceRate}%)</span>
                  <input className={s.quotationInput} type="number" min="0" max="100" value={quotationAdvanceRate} onChange={(e) => setQuotationAdvanceRate(Number(e.target.value))} />
                </div>
                <div className={`${s.quotationSummaryRow} ${s.quotationSummaryBalance}`}>
                  <span>Saldo</span>
                  <span>{formatCurrency(calcQuotation.balance)}</span>
                </div>
              </div>
            </div>

            <div className={s.sectionBlock}>
              <div className={s.sectionHeader}>
                <FileText size={18} />
                <div className={s.sectionTitle}>Condiciones</div>
              </div>
              <div className={s.formRow}>
                <div className={s.field}>
                  <label className={s.label}>Tiempo estimado (días)</label>
                  <input className={s.input} type="number" min="1" value={quotationDeliveryDays} onChange={(e) => setQuotationDeliveryDays(Number(e.target.value))} />
                </div>
                <div className={`${s.field} ${s.colSpan2}`}>
                  <label className={s.label}>Condiciones de pago</label>
                  <input className={s.input} value={quotationPaymentTerms} onChange={(e) => setQuotationPaymentTerms(e.target.value)} />
                </div>
              </div>
              <div className={s.field}>
                <label className={s.label}>Observaciones</label>
                <textarea className={s.textarea} rows={2} value={quotationNotes} onChange={(e) => setQuotationNotes(e.target.value)} />
              </div>
            </div>

            <div className={s.formActions}>
              <Button variant="secondary" onClick={() => setQuotationOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveQuotation} disabled={quotationSaving || quotationLines.length === 0}>
                {quotationSaving ? 'Guardando...' : 'Generar y enviar cotización'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <CustomOrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Editar Pedido Personalizado' : 'Nuevo Pedido Personalizado'}
        step={wizardStep}
        steps={['Cliente', 'Producto y personalización', 'Entrega', 'Resumen']}
        onStepChange={(newStep) => {
          if (validateStep(wizardStep)) setWizardStep(newStep);
        }}
        onBack={() => setWizardStep(prev => prev - 1)}
        onSubmit={handleSave}
        saving={saving}
        isEditing={!!editingId}
      >
        <div className={s.form}>
          {/* Cliente */}
          <div className={`${s.sectionBlock} ${s.sectionBlockAcccent}`}>
            <div className={s.sectionHeader}>
              <User size={18} />
              <div className={s.sectionTitle}>Cliente</div>
            </div>
            <p className={s.sectionDescription}>Selecciona el cliente que solicita la personalización. Los datos de contacto se completan automáticamente.</p>
            <div className={s.formRow}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <label htmlFor="admin-cliente" className={s.label}>Cliente <span className={s.labelRequired}>*</span></label>
                <select id="admin-cliente" className={`${s.select} ${touched['clienteNombre'] && errors['clienteNombre'] ? s.selectError : ''}`} value={form.clienteNombre} onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })} onBlur={() => handleBlur('clienteNombre')}>
                  <option value="">Selecciona un cliente</option>
                  {clientes.length === 0 && <option value="" disabled>No hay clientes disponibles</option>}
                  {clientes.map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
                {touched['clienteNombre'] && errors['clienteNombre'] && <span className={s.errorText}>{errors['clienteNombre']}</span>}
                {clientes.length === 0 && <span className={s.hintText}>No se encontraron clientes registrados.</span>}
              </div>
            </div>
            <div className={s.formRow}>
              <div className={s.field}>
                <label htmlFor="admin-email" className={s.label}>Email</label>
                <input id="admin-email" className={s.input} placeholder="Email" value={form.clienteEmail} onChange={(e) => setForm({ ...form, clienteEmail: e.target.value })} />
              </div>
              <div className={s.field}>
                <label htmlFor="admin-telefono" className={s.label}>Teléfono</label>
                <input id="admin-telefono" className={s.input} placeholder="Teléfono" value={form.clienteTelefono} onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Producto solicitado */}
          <div className={s.sectionBlock}>
            <div className={s.sectionHeader}>
              <Package size={18} />
              <div className={s.sectionTitle}>Producto solicitado</div>
            </div>
            <p className={s.sectionDescription}>Define el producto base y sus atributos físicos para la personalización. Puedes agregar varios productos.</p>
            
            {/* Lista de productos agregados */}
            {form.items.length > 1 && (
              <div className={s.filePreview} style={{ marginBottom: 12 }}>
                {form.items.map((item, idx) => (
                  <div key={idx} className={`${s.fileChip} ${idx === activeItemIndex ? s.multiSelectOptionSelected : ''}`} style={{ cursor: 'pointer' }} onClick={() => setActiveItemIndex(idx)}>
                    <Package size={16} />
                    <span className={s.fileChipName}>{item.descripcion || `Producto ${idx + 1}`}</span>
                    {form.items.length > 1 && (
                      <button type="button" className={s.removeFileBtn} onClick={(e) => { e.stopPropagation(); const items = form.items.filter((_, i) => i !== idx); setForm({ ...form, items }); if (activeItemIndex >= items.length) setActiveItemIndex(Math.max(0, items.length - 1)); }}>Eliminar</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className={s.formRow}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <label htmlFor="admin-producto" className={s.label}>Producto base <span className={s.labelRequired}>*</span></label>
                <input
                  id="admin-producto"
                  className={s.input}
                  placeholder="Escribe el nombre del producto o selecciona uno del catálogo"
                  value={form.items[activeItemIndex]?.descripcion || ''}
                  onChange={(e) => {
                    const items = [...form.items];
                    items[activeItemIndex] = { ...items[activeItemIndex], descripcion: e.target.value };
                    setForm({ ...form, items });
                  }}
                  list="productos-sugeridos"
                />
                <datalist id="productos-sugeridos">
                  {productos.map(p => (
                    <option key={p.id} value={p.nombre} />
                  ))}
                </datalist>
                {productos.length > 0 && <span className={s.hintText}>Sugerencias del catálogo disponibles.</span>}
              </div>
            </div>
            <div className={s.formRow}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <button type="button" className={s.quotationAddLine} onClick={() => {
                  if (!(form.items[activeItemIndex]?.descripcion || '').trim()) {
                    toast.error('Ingresa el nombre del producto');
                    return;
                  }
                  const newItem = {
                    descripcion: form.items[activeItemIndex]?.descripcion || '',
                    tipoPersonalizacion: form.items[activeItemIndex]?.tipoPersonalizacion || 'BORDADO_ESTAMPADO',
                    especificaciones: form.items[activeItemIndex]?.especificaciones || '',
                    cantidad: form.items[activeItemIndex]?.cantidad || '1',
                    talla: form.items[activeItemIndex]?.talla || '',
                    color: form.items[activeItemIndex]?.color || '',
                    material: form.items[activeItemIndex]?.material || '',
                    ubicacion: form.items[activeItemIndex]?.ubicacion || [],
                    personalizaciones: form.items[activeItemIndex]?.personalizaciones || [],
                  };
                  const updatedItems = [...form.items, newItem];
                  updatedItems[activeItemIndex] = { descripcion: '', tipoPersonalizacion: 'BORDADO_ESTAMPADO', especificaciones: '', cantidad: '1', talla: '', color: '', material: '', ubicacion: [], personalizaciones: [] };
                  setForm({
                    ...form,
                    items: updatedItems,
                    cantidadTotal: form.cantidadTotal + Number(newItem.cantidad || 0),
                  });
                  setActiveItemIndex(updatedItems.length - 1);
                  setCurrentProduct('');
                }}>
                  <PlusCircle size={16} />
                  <span>Agregar otro producto</span>
                </button>
              </div>
            </div>
            <div className={s.formRowAttr4}>
              <div className={s.field}>
                <label htmlFor="admin-cantidad" className={s.label}>Cantidad <span className={s.labelRequired}>*</span></label>
                <input id="admin-cantidad" type="number" className={s.input} placeholder="Cantidad" value={form.items[activeItemIndex]?.cantidad || '1'} onChange={(e) => {
                  const items = [...form.items];
                  items[activeItemIndex] = { ...items[activeItemIndex], cantidad: e.target.value };
                  setForm({ ...form, items, cantidadTotal: Number(e.target.value) });
                }} />
              </div>
              <div className={s.field}>
                <label htmlFor="admin-talla" className={s.label}>Talla</label>
                <input id="admin-talla" className={s.input} placeholder="Talla" value={form.items[activeItemIndex]?.talla || ''} onChange={(e) => {
                  const items = [...form.items];
                  items[activeItemIndex] = { ...items[activeItemIndex], talla: e.target.value };
                  setForm({ ...form, items });
                }} />
              </div>
              <div className={s.field}>
                <label htmlFor="admin-color" className={s.label}>Color</label>
                <input id="admin-color" className={s.input} placeholder="Color" value={form.items[activeItemIndex]?.color || ''} onChange={(e) => {
                  const items = [...form.items];
                  items[activeItemIndex] = { ...items[activeItemIndex], color: e.target.value };
                  setForm({ ...form, items });
                }} />
              </div>
              <div className={s.field}>
                <label htmlFor="admin-material" className={s.label}>Material/Tela</label>
                <input id="admin-material" className={s.input} placeholder="Material" value={form.items[activeItemIndex]?.material || ''} onChange={(e) => {
                  const items = [...form.items];
                  items[activeItemIndex] = { ...items[activeItemIndex], material: e.target.value };
                  setForm({ ...form, items });
                }} />
              </div>
            </div>
            <div className={s.formRowAttr4}>
              <div className={s.field}>
                <label htmlFor="admin-tipo-prenda" className={s.label}>Tipo de prenda</label>
                <input id="admin-tipo-prenda" className={s.input} placeholder="Ej: Camiseta, Chaqueta..." value={form.tipoPrenda} onChange={(e) => setForm({ ...form, tipoPrenda: e.target.value })} />
              </div>
              <div className={s.field}>
                <label htmlFor="admin-tecnica" className={s.label}>Técnica</label>
                <input id="admin-tecnica" className={s.input} placeholder="Ej: DTF, Serigrafía..." value={form.tecnicaPersonalizacion} onChange={(e) => setForm({ ...form, tecnicaPersonalizacion: e.target.value })} />
              </div>
              <div className={`${s.field} ${s.colSpan2}`}>
                <label htmlFor="admin-tallas" className={s.label}>Tallas (separadas por coma)</label>
                <input id="admin-tallas" className={s.input} placeholder="S, M, L, XL..." value={form.tallas} onChange={(e) => setForm({ ...form, tallas: e.target.value })} />
              </div>
            </div>
            <div className={s.formRowAttr4}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <label htmlFor="admin-colores" className={s.label}>Colores (separados por coma)</label>
                <input id="admin-colores" className={s.input} placeholder="Rojo, Azul, Negro..." value={form.coloresSolicitados} onChange={(e) => setForm({ ...form, coloresSolicitados: e.target.value })} />
              </div>
            </div>

            <div className={s.formRowAttr4} style={{ marginTop: '16px' }}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <div className={s.sectionHeader} style={{ marginBottom: '8px' }}>
                  <Paintbrush size={18} />
                  <div className={s.sectionTitle}>Personalizaciones del producto</div>
                </div>
                <p className={s.sectionDescription} style={{ marginBottom: '12px' }}>Agrega una o varias personalizaciones para este producto.</p>
              </div>
            </div>

            {(form.items[activeItemIndex]?.personalizaciones || []).map((pers, persIndex) => (
              <div key={persIndex} className={s.registroInfo} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600 }}>Personalización #{persIndex + 1}</div>
                  <button type="button" className={s.removeFileBtn} onClick={() => eliminarPersonalizacion(persIndex)}>Eliminar</button>
                </div>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>Tipo <span className={s.labelRequired}>*</span></label>
                    <select className={s.select} value={pers.tipo} onChange={(e) => actualizarPersonalizacion(persIndex, 'tipo', e.target.value)}>
                      <option value="ESTAMPADO">Estampado</option>
                      <option value="BORDADO">Bordado</option>
                      <option value="SUBLIMACION">Sublimación</option>
                      <option value="VINILO">Vinilo</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Técnica</label>
                    <input className={s.input} placeholder="Ej: DTF, Serigrafía..." value={pers.tecnica || ''} onChange={(e) => actualizarPersonalizacion(persIndex, 'tecnica', e.target.value)} />
                  </div>
                </div>
                <div className={s.formRow}>
                  <div className={`${s.field} ${s.colSpan2}`}>
                    <label className={s.label}>Ubicación</label>
                    <div className={s.multiSelectContainer}>
                      <div className={s.multiSelectOptions}>
                        {['FRENTE', 'ESPALDA', 'MANGA_IZQUIERDA', 'MANGA_DERECHA', 'PECHO', 'OTRA'].map((option) => {
                          const isSelected = (pers.ubicacion || []).includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              className={`${s.multiSelectOption} ${isSelected ? s.multiSelectOptionSelected : ''}`}
                              onClick={() => {
                                const current = pers.ubicacion || [];
                                const next = isSelected ? current.filter((u) => u !== option) : [...current, option];
                                actualizarPersonalizacion(persIndex, 'ubicacion', next);
                              }}
                            >
                              {option.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')}
                            </button>
                          );
                        })}
                      </div>
                      {(pers.ubicacion || []).length > 0 && (
                        <div className={s.multiSelectChips}>
                          {(pers.ubicacion || []).map((u) => (
                            <span key={u} className={s.multiSelectChip}>
                              {u.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')}
                              <button type="button" className={s.multiSelectChipRemove} onClick={() => actualizarPersonalizacion(persIndex, 'ubicacion', (pers.ubicacion || []).filter((val) => val !== u))}>
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={s.field} style={{ marginTop: '12px' }}>
                  <label className={s.label}>Descripción del diseño <span className={s.labelRequired}>*</span></label>
                  <textarea className={s.textarea} rows={2} placeholder="Describe el diseño..." value={pers.descripcion || ''} onChange={(e) => actualizarPersonalizacion(persIndex, 'descripcion', e.target.value)} />
                </div>
                <div className={s.field} style={{ marginTop: '12px' }}>
                  <label className={s.label}>Variantes a personalizar</label>
                  {(pers.variantes || []).map((variante, varIndex) => (
                    <div key={varIndex} className={s.formRow} style={{ marginBottom: '8px' }}>
                      <div className={s.field}>
                        <input className={s.input} placeholder="Talla" value={variante.talla} onChange={(e) => actualizarVariante(persIndex, varIndex, 'talla', e.target.value)} />
                      </div>
                      <div className={s.field}>
                        <input className={s.input} placeholder="Color" value={variante.color} onChange={(e) => actualizarVariante(persIndex, varIndex, 'color', e.target.value)} />
                      </div>
                      <div className={s.field}>
                         <input className={s.input} type="number" min="0" placeholder="Cant." value={variante.cantidad} onChange={(e) => actualizarVariante(persIndex, varIndex, 'cantidad', Number(e.target.value))} />
                      </div>
                      <div className={s.field}>
                        <button type="button" className={s.removeFileBtn} onClick={() => eliminarVariante(persIndex, varIndex)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className={s.quotationAddLine} onClick={() => agregarVariante(persIndex)}>
                    <PlusCircle size={16} />
                    <span>Agregar variante</span>
                  </button>
                  <div style={{ marginTop: '8px', fontWeight: 600 }}>
                    Total personalización: {(pers.variantes || []).reduce((sum: number, v: any) => sum + (Number(v.cantidad) || 0), 0)}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className={s.quotationAddLine} onClick={agregarPersonalizacion} style={{ marginTop: '8px' }}>
              <PlusCircle size={16} />
              <span>Agregar personalización</span>
            </button>
          </div>

          {/* Archivos y Entrega */}
          <div className={s.sectionBlock}>
            <div className={s.sectionHeader}>
              <Image size={18} />
              <div className={s.sectionTitle}>Archivos y Entrega</div>
            </div>
            <p className={s.sectionDescription}>Adjunta referencias visuales y define la fecha esperada de entrega.</p>
            <div className={s.formRow}>
              <div className={`${s.field} ${s.colSpan2}`}>
                <label htmlFor="admin-archivos" className={s.label}>Archivos de referencia (JPG, PNG, PDF)</label>
                <input id="admin-archivos" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className={s.hiddenInput} onChange={handleFileChange} />
                <label htmlFor="admin-archivos" className={s.uploadLabel}>Seleccionar archivos</label>
                {selectedFiles.length > 0 && (
                  <div className={s.filePreview}>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className={s.fileChip}>
                        {file.type.startsWith('image/') && fileUrls[idx] ? (
                          <img src={fileUrls[idx]} alt={file.name} className={s.fileChipImage} />
                        ) : (
                          <FileText size={16} />
                        )}
                        <span className={s.fileChipName}>{file.name}</span>
                        <button type="button" className={s.removeFileBtn} onClick={() => removeFile(idx)}>Eliminar</button>
                      </div>
                    ))}
                  </div>
                )}
                <span className={s.hintText}>Puedes adjuntar múltiples archivos.</span>
              </div>
              <div className={s.field}>
                <label htmlFor="admin-fecha" className={s.label}>Fecha solicitada de entrega</label>
                <input id="admin-fecha" type="date" className={s.input} value={form.fechaEntregaDeseada} onChange={(e) => setForm({ ...form, fechaEntregaDeseada: e.target.value })} />
              </div>
            </div>
            <div className={s.field}>
              <label htmlFor="admin-observaciones" className={s.label}>Observaciones</label>
              <textarea id="admin-observaciones" className={s.textarea} rows={2} placeholder="Notas adicionales..." value={form.notasCliente} onChange={(e) => setForm({ ...form, notasCliente: e.target.value })} />
            </div>
          </div>
        </div>
      </CustomOrderFormModal>

      <Modal open={!!paymentConfirm} onClose={() => setPaymentConfirm(null)} title="Confirmar pago de anticipo" description="Marca el anticipo como recibido para permitir el paso a producción." size="md" variant="form">
        {paymentConfirm && (
          <div className={s.form}>
            <div className={s.registroInfo}>
              <div className={s.formRow}>
                <div className={s.field}>
                  <span className={s.label}>Solicitud</span>
                  <span className={s.infoValue}>{paymentConfirm.numeroSolicitud}</span>
                </div>
                <div className={s.field}>
                  <span className={s.label}>Cliente</span>
                  <span className={s.infoValue}>{paymentConfirm.clienteNombre}</span>
                </div>
              </div>
            </div>
            {paymentConfirm.paymentProofUrl && (
              <div className={s.field}>
                <span className={s.label}>Comprobante</span>
                <a href={paymentConfirm.paymentProofUrl} target="_blank" rel="noreferrer" className={s.fileLink}>
                  Ver comprobante adjunto
                </a>
              </div>
            )}
            <ModalFooter
              actions={[
                { label: 'Cancelar', variant: 'secondary', onClick: () => setPaymentConfirm(null) },
                { label: 'Confirmar anticipo', onClick: async () => {
                  try {
                    await customOrdersApi.adminUpdatePayment(paymentConfirm.id, { anticipoPagado: true, paymentStatus: 'APPROVED' });
                    toast.success('Anticipo confirmado. Ahora puede pasar a producción.');
                    setPaymentConfirm(null);
                    void loadOrders();
                  } catch {
                    toast.error('Error al confirmar pago');
                  }
                } },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal open={!!statusConfirm} onClose={() => { setStatusConfirm(null); setSelectedStatus(null); }} title="Cambiar estado de la solicitud" description="Actualiza el estado de la solicitud personalizada." size="md" variant="form">
        <div className={s.form}>
          {statusConfirm && (
            <CustomOrderStatusSelector
              currentStatus={statusConfirm.estado}
              selectedStatus={selectedStatus ?? statusConfirm.estado}
              onSelectedStatusChange={setSelectedStatus}
            />
          )}
          <ModalFooter
            actions={[
              { label: 'Cancelar', variant: 'secondary', onClick: () => { setStatusConfirm(null); setSelectedStatus(null); }, disabled: saving },
              { label: saving ? 'Guardando...' : 'Guardar cambios', onClick: handleChangeStatus, disabled: saving || !selectedStatus || selectedStatus === statusConfirm?.estado },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};
