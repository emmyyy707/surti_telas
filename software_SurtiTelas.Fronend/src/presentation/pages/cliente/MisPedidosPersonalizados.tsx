import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, CheckCircle, FileText, RefreshCcw, User, Package, Paintbrush, Image, X, PlusCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ModalFooter, type ModalFooterAction } from '@/shared/ui/ModalFooter';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { SearchInput } from '@/shared/ui/SearchInput';
import { customOrdersApi, type CustomOrder } from '@/infrastructure/api/customOrdersApi';
import { catalogApi } from '@/infrastructure/api/catalogApi';
import { CUSTOM_ORDER_STATUS_COLORS } from '@/shared/constants/options';
import { useAuthStore } from '@/core/stores/authStore';
import { CustomOrderFormModal } from '@/presentation/components/CustomOrderFormModal';
import { useLocation } from 'react-router-dom';
import s from './MisPedidosPersonalizados.module.css';

const customOrderItemSchema = z.object({
  productoId: z.string().optional(),
  productoNombre: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  tipoPersonalizacion: z.string().min(1, 'El tipo es obligatorio'),
  especificaciones: z.string().optional(),
  cantidad: z.number().min(1, 'La cantidad es obligatoria'),
  talla: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  ubicacion: z.array(z.string()).optional(),
  distribucionTallas: z.record(z.string(), z.number().nullable()).optional(),
  personalizaciones: z.array(
    z.object({
      tipo: z.string().min(1, 'El tipo es obligatorio'),
      tecnica: z.string().optional(),
      ubicacion: z.array(z.string()).optional(),
      descripcion: z.string().min(1, 'La descripción es obligatoria'),
      archivos: z.array(z.string()).optional(),
      variantes: z.array(
        z.object({
          talla: z.string().min(1, 'La talla es obligatoria'),
          color: z.string().min(1, 'El color es obligatorio'),
          cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
        })
      ).optional(),
    })
  ).optional(),
});

const formSchema = z.object({
  clienteNombre: z.string().min(1, 'El nombre es obligatorio'),
  clienteEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clienteTelefono: z.string().optional(),
  usoFinal: z.string().optional(),
  fechaEntregaDeseada: z.string().optional(),
  notasCliente: z.string().optional(),
  notasReferencia: z.string().optional(),
  tecnica: z.string().optional(),
  tamano: z.string().optional(),
  cantidadDisenos: z.coerce.number().int().positive().optional(),
  numeroColores: z.string().optional(),
  items: z.array(customOrderItemSchema).min(1, 'Agrega al menos un item'),
});

type FormValues = z.infer<typeof formSchema>;

const emptyForm: FormValues = {
  clienteNombre: '',
  clienteEmail: '',
  clienteTelefono: '',
  usoFinal: '',
  fechaEntregaDeseada: '',
  notasCliente: '',
  notasReferencia: '',
  tecnica: '',
  tamano: '',
  cantidadDisenos: 1,
  numeroColores: '',
  items: [
    {
      productoId: '',
      productoNombre: '',
      descripcion: '',
      tipoPersonalizacion: 'BORDADO_ESTAMPADO',
      especificaciones: '',
      cantidad: 1,
      talla: '',
      color: '',
      material: '',
      ubicacion: [],
      distribucionTallas: {},
      personalizaciones: [],
    },
  ],
};

const toUbicacionArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') return value.split(',').map((u) => u.trim()).filter(Boolean);
  return [];
};

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

export const MisPedidosPersonalizados: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const location = useLocation();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<CustomOrder | null>(null);

  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');

  const [rejectConfirm, setRejectConfirm] = useState<CustomOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [uploadPaymentOpen, setUploadPaymentOpen] = useState(false);
  const [uploadPaymentOrderId, setUploadPaymentOrderId] = useState<string | null>(null);

  const [productos, setProductos] = useState<{ id: string; nombre: string; tela?: string; colores?: string[]; tallas?: string[] }[]>([]);
  const [, setLoadingCatalog] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [stepperStep, setStepperStep] = useState(1);
  const [colorRows, setColorRows] = useState<{ id: number; color: string; cantidad: string }[]>([{ id: Date.now(), color: '', cantidad: '' }]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [editingPersonalizacionIndex, setEditingPersonalizacionIndex] = useState<number | null>(null);
  const [showPersonalizacionForm, setShowPersonalizacionForm] = useState(false);

  useEffect(() => {
    if (location.pathname === '/cliente/cotizaciones/nueva') {
      setEditingId(null);
      setFormOpen(true);
    }
  }, [location.pathname]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.estado === 'SOLICITUD_RECIBIDA' || o.estado === 'EN_REVISION').length;
  const quotedOrders = orders.filter(o => o.estado === 'COTIZADO' || o.estado === 'COTIZACION_ACEPTADA').length;
  const productionOrders = orders.filter(o => o.estado === 'EN_PRODUCCION').length;

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors: formErrorsHook }, getValues } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: emptyForm,
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const cleanFormValues = (values: FormValues): FormValues => {
    return {
      ...values,
      items: values.items.map((item) => ({
        ...item,
        ubicacion: Array.isArray(item.ubicacion) ? item.ubicacion : [],
        distribucionTallas: Object.fromEntries(
          Object.entries(item.distribucionTallas || {}).filter(([, v]) => v !== undefined && v !== null)
        ) as Record<string, number | null>,
        personalizaciones: (item.personalizaciones || [])
          .map((pers) => ({
            ...pers,
            ubicacion: Array.isArray(pers.ubicacion) ? pers.ubicacion : [],
            variantes: (pers.variantes || [])
              .filter((v) => Number(v.cantidad) > 0)
              .map((v) => ({
                ...v,
                cantidad: Number(v.cantidad),
              })),
          }))
          .filter((pers) => {
            const hasDesc = !!pers.descripcion && pers.descripcion.trim() !== '';
            const hasUbic = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
            const hasVar = (pers.variantes || []).length > 0;
            return hasDesc || hasUbic || hasVar;
          }),
      })),
    };
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const values = getValues();
    const cleaned = cleanFormValues(values);
    reset(cleaned);
    await onSubmit(e);
  };

  const ubicacionValues = watch(`items.${activeItemIndex}.ubicacion`) as string[] | undefined;

  const agregarProducto = () => {
    const current = watch(`items.${activeItemIndex}`);
    if (!(current.productoNombre || '').trim()) {
      toast.error('Ingresa el nombre del producto');
      return;
    }
    appendItem({
      productoId: current.productoId || '',
      productoNombre: current.productoNombre || '',
      descripcion: current.descripcion || current.productoNombre || '',
      tipoPersonalizacion: current.tipoPersonalizacion || 'BORDADO_ESTAMPADO',
      especificaciones: current.especificaciones || '',
      cantidad: current.cantidad || 1,
      talla: current.talla || '',
      color: current.color || '',
      material: current.material || '',
      ubicacion: current.ubicacion || [],
      personalizaciones: current.personalizaciones || [],
    });
    setValue(`items.${activeItemIndex}.productoNombre`, '');
    setValue(`items.${activeItemIndex}.productoId`, '');
    setValue(`items.${activeItemIndex}.descripcion`, '');
    setValue(`items.${activeItemIndex}.cantidad`, 1);
    setValue(`items.${activeItemIndex}.talla`, '');
    setValue(`items.${activeItemIndex}.color`, '');
    setValue(`items.${activeItemIndex}.material`, '');
    setValue(`items.${activeItemIndex}.ubicacion`, []);
    setValue(`items.${activeItemIndex}.personalizaciones`, []);
    toast.success('Producto agregado');
  };

  const agregarPersonalizacion = () => {
    const current = watch(`items.${activeItemIndex}.personalizaciones`) as any[] || [];
    const newPers = {
      tipo: 'ESTAMPADO',
      tecnica: '',
      ubicacion: [],
      descripcion: '',
      archivos: [],
      variantes: [],
    };
    setValue(`items.${activeItemIndex}.personalizaciones`, [...current, newPers]);
  };

  const eliminarPersonalizacion = (persIndex: number) => {
    const current = watch(`items.${activeItemIndex}.personalizaciones`) as any[] || [];
    setValue(`items.${activeItemIndex}.personalizaciones`, current.filter((_, i) => i !== persIndex));
  };

  const actualizarPersonalizacion = (persIndex: number, field: string, value: any) => {
    const current = watch(`items.${activeItemIndex}.personalizaciones`) as any[] || [];
    const updated = current.map((p, i) => i === persIndex ? { ...p, [field]: value } : p);
    setValue(`items.${activeItemIndex}.personalizaciones`, updated);
  };

  const agregarVariante = (persIndex: number) => {
    const current = watch(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`) as any[] || [];
    setValue(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`, [...current, { talla: '', color: '', cantidad: 1 }]);
  };

  const eliminarVariante = (persIndex: number, varIndex: number) => {
    const current = watch(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`) as any[] || [];
    setValue(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`, current.filter((_, i) => i !== varIndex));
  };

  const actualizarVariante = (persIndex: number, varIndex: number, field: string, value: any) => {
    const current = watch(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`) as any[] || [];
    const updated = current.map((v, i) => i === varIndex ? { ...v, [field]: value } : v);
    setValue(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes`, updated);

    if (field === 'cantidad') {
      const cantidadTotal = Number(watch(`items.${activeItemIndex}.cantidad`) || 0);
      const nuevaCantidad = Number(value) || 0;
      if (cantidadTotal > 0 && nuevaCantidad > cantidadTotal) {
        toast.error(`Solo hay ${cantidadTotal} unidades disponibles para esta variante.`);
        setValue(`items.${activeItemIndex}.personalizaciones.${persIndex}.variantes.${varIndex}.cantidad`, cantidadTotal as any);
      }
    }
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await customOrdersApi.list({ page, limit: pageSize, search: search || undefined });
      setOrders(result.items ?? []);
      setTotalPages(result.totalPages ?? 1);
      setTotalItems(result.totalRecords ?? 0);
    } catch {
      toast.error('Error al cargar tus pedidos personalizados');
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
        const productosRes = await catalogApi.list({ limit: 100 });
        if (!cancelled) {
          setProductos((productosRes.data ?? []).map(p => ({ id: p.id ?? '', nombre: p.nombre, tela: p.tela, colores: p.colores, tallas: p.tallas })));
        }
      } catch {
        if (!cancelled) {
          setProductos([]);
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => { cancelled = true };
  }, [formOpen]);

  useEffect(() => {
    const subscription = watch((value) => {
      const nombre = value.items?.[activeItemIndex]?.productoNombre;
      const descripcion = value.items?.[activeItemIndex]?.descripcion;
      if (nombre && !descripcion) {
        setValue(`items.${activeItemIndex}.descripcion`, nombre, { shouldDirty: false, shouldTouch: false });
      }
    });
    return () => subscription.unsubscribe();
  }, [activeItemIndex, watch, setValue]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      ...emptyForm,
      clienteNombre: currentUser?.name ?? '',
      clienteEmail: currentUser?.email ?? '',
    });
    setPaymentProofFile(null);
    setPaymentProofUrl('');
    setSelectedFiles([]);
    setFileUrls([]);
    setStepperStep(1);
    setColorRows([{ id: Date.now(), color: '', cantidad: '' }]);
    setFormOpen(true);
  };

  const openEdit = (order: CustomOrder) => {
    if (order.estado !== 'SOLICITUD_RECIBIDA') {
      toast.error('Solo puedes editar solicitudes en estado "Solicitud recibida"');
      return;
    }
    setEditingId(order.id);
    reset({
      clienteNombre: order.clienteNombre,
      clienteEmail: order.clienteEmail ?? '',
      clienteTelefono: order.clienteTelefono ?? '',
      usoFinal: order.usoFinal ?? '',
      fechaEntregaDeseada: order.fechaEntregaDeseada ? new Date(order.fechaEntregaDeseada).toISOString().slice(0, 10) : '',
      notasCliente: order.notasCliente ?? '',
      notasReferencia: order.notasReferencia ?? '',
      tecnica: '',
      tamano: '',
      cantidadDisenos: 1,
      numeroColores: '',
      items: order.items.map((item) => ({
        productoId: item.productoId ?? '',
        productoNombre: item.productoNombre ?? '',
        descripcion: item.descripcion,
        tipoPersonalizacion: item.tipoPersonalizacion,
        especificaciones: item.especificaciones ?? '',
        cantidad: item.cantidad,
        talla: item.talla ?? '',
        color: item.color ?? '',
        material: item.material ?? '',
        ubicacion: toUbicacionArray(item.ubicacion),
        personalizaciones: (item.personalizaciones || []).map((pers: any) => ({
          tipo: pers.tipo,
          tecnica: pers.tecnica ?? '',
          ubicacion: toUbicacionArray(pers.ubicacion),
          descripcion: pers.descripcion,
          archivos: pers.archivos || [],
          variantes: (pers.variantes || []).map((v: any) => ({
            talla: v.talla,
            color: v.color,
            cantidad: v.cantidad,
          })),
        })),
      })),
    });
    setPaymentProofFile(null);
    setPaymentProofUrl(order.paymentProofUrl ?? '');
    setSelectedFiles([]);
    setFileUrls([]);
    setStepperStep(1);
    setColorRows([{ id: Date.now(), color: '', cantidad: '' }]);
    setFormOpen(true);
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

  const onSubmit = handleSubmit(
    async (values) => {
      console.log('[QUOTE] onSubmit ejecutado', values);
      const onSubmitPayload = { ...values, items: values.items.map((item: FormValues['items'][number], index: number) => ({
        ...item,
        orden: index,
        personalizaciones: (item.personalizaciones || [])
          .filter((pers: any) => {
            const hasTipo = !!pers.tipo;
            const hasDescripcion = !!pers.descripcion && pers.descripcion.trim() !== '';
            const hasUbicacion = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
            const hasVariantes = (pers.variantes || []).some((v: any) => Number(v.cantidad) > 0);
            return hasTipo && (hasDescripcion || hasUbicacion || hasVariantes);
          })
          .map((pers: any, pIndex: number) => ({
            ...pers,
            orden: pIndex,
            variantes: (pers.variantes || []).map((variante: any) => ({
              talla: variante.talla,
              color: variante.color,
              cantidad: Number(variante.cantidad),
            })),
          })),
      })) };

      console.log('[QUOTE] validación iniciada');

      const validationErrors: string[] = [];
      const validationDetails: string[] = [];

      for (const item of onSubmitPayload.items) {
        const cantidadTotal = Number(item.cantidad) || 0;
        const distribucionTotal = Object.values(item.distribucionTallas || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

        if (!item.descripcion || !item.descripcion.trim()) {
          validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la descripción del producto es obligatoria.`);
          validationDetails.push(`descripcion vacía para producto ${item.productoNombre || 'sin nombre'}`);
        }
        if (!item.productoNombre || !item.productoNombre.trim()) {
          validationErrors.push(`El producto #${onSubmitPayload.items.indexOf(item) + 1}: el nombre del producto es obligatorio.`);
          validationDetails.push(`productoNombre vacío en índice ${onSubmitPayload.items.indexOf(item)}`);
        }
        if (cantidadTotal <= 0) {
          validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la cantidad debe ser mayor a 0.`);
          validationDetails.push(`cantidadTotal=${cantidadTotal}`);
        }
        if (distribucionTotal !== cantidadTotal && cantidadTotal > 0) {
          validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la distribución de prendas (${distribucionTotal}) no coincide con la cantidad total (${cantidadTotal}).`);
          validationDetails.push(`distribucionTotal=${distribucionTotal}, cantidadTotal=${cantidadTotal}`);
        }

        const totalPersonalizado = (item.personalizaciones || []).reduce((sum: number, pers: any) => sum + (pers.variantes || []).reduce((s: number, v: any) => s + (Number(v.cantidad) || 0), 0), 0);
        if (totalPersonalizado > cantidadTotal && cantidadTotal > 0) {
          validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la cantidad personalizada (${totalPersonalizado}) supera la cantidad total (${cantidadTotal}).`);
          validationDetails.push(`totalPersonalizado=${totalPersonalizado}, cantidadTotal=${cantidadTotal}`);
        }

        for (const pers of item.personalizaciones || []) {
          if (!pers.descripcion || !pers.descripcion.trim()) {
            validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la descripción de la personalización es obligatoria.`);
            validationDetails.push(`personalizacion descripcion vacía`);
          }
          for (const variante of pers.variantes || []) {
            if (!variante.talla || !variante.color || Number(variante.cantidad) <= 0) {
              validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la variante "${variante.talla || 'sin talla'} / ${variante.color || 'sin color'}" es inválida.`);
              validationDetails.push(`variante inválida: talla=${variante.talla}, color=${variante.color}, cantidad=${variante.cantidad}`);
            }
            if (Number(variante.cantidad) > cantidadTotal) {
              validationErrors.push(`Producto "${item.productoNombre || 'sin nombre'}": la variante ${variante.talla} ${variante.color} tiene ${variante.cantidad} unidades, pero el producto solo tiene ${cantidadTotal}.`);
              validationDetails.push(`variante cantidad excede total`);
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        console.log('[QUOTE] validación de negocio fallida', validationErrors);
        toast.error('Errores de validación', { description: validationErrors.join('\n') });
        return;
      }

      console.log('[QUOTE] validación correcta');

      const basePayload = {
        clienteId: currentUser?.uid,
        clienteNombre: values.clienteNombre,
        clienteEmail: values.clienteEmail || undefined,
        clienteTelefono: values.clienteTelefono || undefined,
        notasReferencia: values.notasReferencia || undefined,
        descripcionGeneral: values.items[0]?.descripcion || undefined,
        usoFinal: values.usoFinal || undefined,
        fechaEntregaDeseada: values.fechaEntregaDeseada || undefined,
        notasCliente: values.notasCliente || undefined,
        items: values.items.map((item: FormValues['items'][number], index: number) => ({
          descripcion: item.descripcion,
          tipoPersonalizacion: item.tipoPersonalizacion,
          especificaciones: item.especificaciones || undefined,
          cantidad: Number(item.cantidad),
          talla: item.talla || undefined,
          color: item.color || undefined,
          material: item.material || undefined,
          ubicacion: item.ubicacion || undefined,
          orden: index,
          personalizaciones: (item.personalizaciones || []).map((pers: any, pIndex: number) => ({
            tipo: pers.tipo,
            tecnica: pers.tecnica || undefined,
            ubicacion: pers.ubicacion || undefined,
            descripcion: pers.descripcion,
            archivos: pers.archivos || undefined,
            orden: pIndex,
            variantes: (pers.variantes || []).map((variante: any) => ({
              talla: variante.talla,
              color: variante.color,
              cantidad: Number(variante.cantidad),
            })),
          })),
        })),
      };

      console.log('[QUOTE] payload', basePayload);

      setSaving(true);
      try {
        let orderId = editingId;
        if (editingId) {
          await customOrdersApi.clientUpdate(editingId, { ...basePayload, paymentProofUrl: paymentProofUrl || undefined });
          toast.success('Solicitud actualizada');
        } else {
          console.log('[QUOTE] POST /custom-orders');
          const created = await customOrdersApi.create(basePayload);
          console.log('[QUOTE] respuesta', created);
          orderId = created.id;
          toast.success('Solicitud creada');
        }

        if (orderId && paymentProofFile) {
          try {
            const result = await customOrdersApi.uploadPaymentProof(orderId, paymentProofFile);
            await customOrdersApi.updatePayment(orderId, { paymentProofUrl: result.paymentProofUrl });
          } catch {
            toast.error('Error al subir comprobante de pago');
          }
        }

        setFormOpen(false);
        void loadOrders();
      } catch (err: unknown) {
        console.log('[QUOTE] ERROR:', err);
        const message = err instanceof Error ? err.message : 'Error al guardar solicitud';
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
    (errors) => {
      const values = getValues();
      console.log('[QUOTE] valores items al validar', JSON.stringify(values.items, null, 2));
      const manualParse = formSchema.safeParse(values);
      if (!manualParse.success) {
        console.error('[QUOTE] errores Zod:', manualParse.error.issues);
      } else {
        console.error('[QUOTE] errores Zod: validación manual pasó, pero RHF reportó errores');
      }
      console.log('[QUOTE] validación React Hook Form fallida', errors);
      toast.error('Errores de validación', {
        description: Object.entries(errors)
          .map(([key, value]) => {
            const val = value as any;
            if (val?.message) return `${key}: ${val.message}`;
            if (Array.isArray(val)) return `${key}: ${val.map((v: any) => v?.message || 'Campo inválido').join(', ')}`;
            return `${key}: Campo inválido`;
          })
          .join('\n')
      });
    }
  );

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await customOrdersApi.remove(deleteConfirm.id);
      toast.success('Solicitud eliminada');
      setDeleteConfirm(null);
      void loadOrders();
    } catch {
      toast.error('No se pudo eliminar la solicitud');
    }
  };

  const submitOrder = async (order: CustomOrder) => {
    try {
      await customOrdersApi.submit(order.id);
      toast.success('Solicitud enviada a revisión');
      void loadOrders();
    } catch {
      toast.error('Error al enviar solicitud');
    }
  };

  const acceptQuotation = async (order: CustomOrder) => {
    try {
      await customOrdersApi.acceptQuotation(order.id);
      toast.success('Cotización aceptada. Ahora puedes realizar el pago del anticipo.');
      void loadOrders();
    } catch {
      toast.error('Error al aceptar cotización');
    }
  };

  const rejectQuotation = async (order: CustomOrder) => {
    setRejectConfirm(order);
    setRejectReason('');
  };

  const confirmRejectQuotation = async () => {
    if (!rejectConfirm || !rejectReason.trim()) {
      toast.error('Debes ingresar un motivo de rechazo');
      return;
    }
    try {
      await customOrdersApi.rejectQuotation(rejectConfirm.id, rejectReason.trim());
      toast.success('Cotización rechazada');
      setRejectConfirm(null);
      setRejectReason('');
      void loadOrders();
    } catch {
      toast.error('Error al rechazar cotización');
    }
  };

  const columns = useMemo(() => [
    {
      key: 'numeroSolicitud',
      header: 'Solicitud',
      render: (row: CustomOrder) => (
        <span className={s.tdMono + ' ' + s.tdPrimary}>{row.numeroSolicitud}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row: CustomOrder) => (
        <Badge variant={CUSTOM_ORDER_STATUS_COLORS[row.estado] ?? 'default'}>{getStatusLabel(row.estado)}</Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      render: (row: CustomOrder) => (
        <span className={s.tdMono}>{new Date(row.updatedAt).toLocaleDateString('es-CO')}</span>
      ),
    },
  ], []);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => o.numeroSolicitud.toLowerCase().includes(q));
  }, [orders, search]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
           <h1 className={s.pageTitle}>Mis Cotizaciones</h1>
          <p className={s.pageSubtitle}>Gestiona tus solicitudes, cotizaciones y envíos</p>
        </div>
        <Button onClick={openCreate} className="inline-flex items-center gap-2">
          <Plus size={18} />
          <span>Nueva solicitud</span>
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
            <SearchInput
              className={s.searchInput}
              placeholder="Buscar por número de solicitud..."
              value={search}
              onSearch={setSearch}
              onChange={(e) => setSearch(e.target.value)}
              debounceMs={100}
              minChars={0}
            />
          </div>
          <Button onClick={loadOrders} disabled={loading} variant="secondary">
            <RefreshCcw size={16} className="mr-2" />
            Actualizar
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={loading ? 'Cargando...' : 'No tienes pedidos personalizados'}
          enableRowSelection={false}
          maxVisibleColumns={10}
          serverMode
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          detailPanel={{
            title: (row) => `Solicitud ${row.numeroSolicitud}`,
            render: (row, onClose) => (
              <div className={s.form}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <span className={s.label}>Cliente</span>
                    <span className={s.infoValue}>{row.clienteNombre}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Estado</span>
                    <Badge variant={CUSTOM_ORDER_STATUS_COLORS[row.estado] ?? 'default'}>{getStatusLabel(row.estado)}</Badge>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Email</span>
                    <span className={s.infoValue}>{row.clienteEmail ?? '-'}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Teléfono</span>
                    <span className={s.infoValue}>{row.clienteTelefono ?? '-'}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Uso final</span>
                    <span className={s.infoValue}>{row.usoFinal ?? '-'}</span>
                  </div>
                  <div className={s.field}>
                    <span className={s.label}>Fecha límite</span>
                    <span className={s.infoValue}>{row.fechaEntregaDeseada ? new Date(row.fechaEntregaDeseada).toLocaleDateString('es-CO') : '-'}</span>
                  </div>
                </div>

                 {row.descripcionGeneral && (
                   <div className={s.registroInfo}>
                     <span className={s.label}>Descripción</span>
                     <span className={s.infoValue}>{row.descripcionGeneral}</span>
                   </div>
                 )}

                 {row.items?.length > 0 && (
                   <div>
                     <span className={s.label} style={{ marginBottom: '10px', display: 'block' }}>Productos</span>
                     <div style={{ display: 'grid', gap: '12px' }}>
                       {row.items.map((item, idx) => (
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

                   {row.cotizacion && (
                     <div className={s.registroInfo}>
                       <span className={s.label} style={{ marginBottom: '12px', display: 'block' }}>Cotización {row.cotizacion.numeroCotizacion ? `#${row.cotizacion.numeroCotizacion}` : ''}</span>
                       <div className={s.formRow}>
                      <div className={s.field}>
                        <span className={s.label}>Estado</span>
                        <Badge variant={row.cotizacion.estado === 'ACEPTADA' ? 'success' : row.cotizacion.estado === 'RECHAZADA' ? 'danger' : row.cotizacion.estado === 'ENVIADA' ? 'info' : 'default'}>
                          {row.cotizacion.estado}
                        </Badge>
                      </div>
                      <div className={s.field}>
                        <span className={s.label}>Válida hasta</span>
                        <span className={s.infoValue}>{row.cotizacion.validaHasta ? new Date(row.cotizacion.validaHasta).toLocaleDateString('es-CO') : '-'}</span>
                      </div>
                      <div className={s.field}>
                        <span className={s.label}>Condiciones</span>
                        <span className={s.infoValue}>{row.cotizacion.condicionesPago ?? '-'}</span>
                      </div>
                    </div>

                    {row.cotizacion.detalles?.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <span className={s.label} style={{ marginBottom: '8px', display: 'block' }}>Desglose</span>
                        <div className={s.quotationTable}>
                          <div className={s.quotationHeader}>
                            <span className={s.quotationColDesc}>Concepto</span>
                            <span className={s.quotationColCant}>Cant.</span>
                            <span className={s.quotationColUnit}>P. unitario</span>
                            <span className={s.quotationColSub}>Subtotal</span>
                          </div>
                          {row.cotizacion.detalles.map((detalle) => (
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
                            <span>{formatCurrency(Number(row.cotizacion.subtotal))}</span>
                          </div>
                          <div className={s.quotationSummaryRow}>
                            <span>Descuento</span>
                            <span>{formatCurrency(Number(row.cotizacion.descuento))}</span>
                          </div>
                          <div className={s.quotationSummaryRow}>
                            <span>Impuestos</span>
                            <span>{formatCurrency(Number(row.cotizacion.impuestos))}</span>
                          </div>
                          <div className={`${s.quotationSummaryRow} ${s.quotationSummaryTotal}`}>
                            <span>Total</span>
                            <span>{formatCurrency(Number(row.cotizacion.total))}</span>
                          </div>
                          {row.cotizacion.estado === 'ENVIADA' && (
                            <>
                              <div className={s.quotationSummaryRow}>
                                <span>Anticipo (50%)</span>
                                <span>{formatCurrency(Number(row.cotizacion.total) * 0.5)}</span>
                              </div>
                              <div className={s.quotationSummaryRow}>
                                <span>Saldo</span>
                                <span>{formatCurrency(Number(row.cotizacion.total) * 0.5)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {row.items.length > 0 && (
                  <div>
                    <span className={s.label} style={{ marginBottom: '10px', display: 'block' }}>Items</span>
                    <div className="space-y-2">
                      {row.items.map((item) => (
                        <div key={item.id} className={s.registroInfo}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <span className={s.infoValue} style={{ display: 'block', marginBottom: '6px' }}>{item.descripcion}</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                 <span className={s.infoLabel}>Tipo: {(item.tipoPersonalizacion || '').replace(/_/g, ' ')}</span>
                                <span className={s.infoLabel}>Cantidad: {item.cantidad}</span>
                                {item.especificaciones && <span className={s.infoLabel}>Especificaciones: {item.especificaciones}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(row.paymentKey || row.paymentProofUrl) && (
                  <div className={s.registroInfo}>
                    <span className={s.label} style={{ marginBottom: '10px', display: 'block' }}>Pago</span>
                    <div className={s.formRow}>
                      {row.paymentKey && (
                        <div className={s.field}>
                          <span className={s.label}>Llave de pago</span>
                          <span className={s.infoValue}>{row.paymentKey}</span>
                        </div>
                      )}
                      {row.paymentProofUrl && (
                        <div className={s.field}>
                          <span className={s.label}>Comprobante</span>
                          <a href={row.paymentProofUrl} target="_blank" rel="noreferrer" className={s.fileLink}>
                            Ver comprobante
                          </a>
                        </div>
                      )}
                    </div>
                    <div className={s.field}>
                      <span className={s.label}>Estado del pago</span>
                      <Badge variant={row.anticipoPagado ? 'success' : 'warning'}>
                        {row.anticipoPagado ? 'Anticipo confirmado' : row.paymentStatus === 'PENDING' ? 'Pendiente de revisión' : 'Sin comprobante'}
                      </Badge>
                    </div>
                  </div>
                )}

                <ModalFooter
                  actions={[
                    { label: 'Cerrar', variant: 'secondary', onClick: onClose },
                    ...(row.estado === 'SOLICITUD_RECIBIDA'
                      ? [{ label: 'Enviar a revisión', onClick: () => submitOrder(row) } as ModalFooterAction]
                      : []),
                    ...(row.estado === 'COTIZADO'
                      ? [
                          { label: 'Aceptar cotización', onClick: () => acceptQuotation(row) } as ModalFooterAction,
                          { label: 'Rechazar cotización', variant: 'danger', onClick: () => rejectQuotation(row) } as ModalFooterAction,
                        ]
                      : []),
                    ...(row.estado === 'PAGO_PENDIENTE' && !row.anticipoPagado
                      ? [{ label: 'Subir comprobante', onClick: () => { setUploadPaymentOrderId(row.id); setPaymentProofFile(null); setPaymentProofUrl(row.paymentProofUrl ?? ''); setUploadPaymentOpen(true); } } as ModalFooterAction]
                      : []),
                  ]}
                />
              </div>
            ),
          }}
          actions={(row) => [
            ...(row.estado === 'SOLICITUD_RECIBIDA'
              ? [{ label: 'Editar', icon: <Edit3 size={14} />, onClick: () => openEdit(row) }]
              : []),
            { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(row), danger: true },
          ]}
        />
      </div>

      <CustomOrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Editar solicitud' : 'Solicitar cotización'}
        step={stepperStep}
        steps={['Cliente', 'Producto y personalización', 'Entrega', 'Resumen']}
        onStepChange={(newStep) => {
          if (stepperStep === 1 && !formErrorsHook.clienteNombre) {
            setStepperStep(newStep);
          } else if (stepperStep === 2) {
            setStepperStep(newStep);
          } else if (stepperStep === 3) {
            setStepperStep(newStep);
          } else if (stepperStep === 4) {
            setStepperStep(newStep);
          }
        }}
        onBack={() => setStepperStep(prev => prev - 1)}
        onSubmit={handleFormSubmit}
        saving={saving}
        isEditing={!!editingId}
      >
        <form onSubmit={handleFormSubmit} className={s.form}>
          {stepperStep === 1 && (
            <div className={`${s.sectionBlock} ${s.sectionBlockAcccent}`}>
              <div className={s.sectionHeader}>
                <User size={18} />
                <div className={s.sectionTitle}>Cliente</div>
              </div>
              <p className={s.sectionDescription}>Selecciona el cliente que solicita la personalización.</p>
              <div className={s.formRow}>
                <div className={`${s.field} ${s.colSpan2}`}>
                  <label htmlFor="cliente-nombre" className={s.label}>Cliente <span className={s.labelRequired}>*</span></label>
                  <input
                    id="cliente-nombre"
                    className={`${s.input}`}
                    placeholder="Cliente"
                    {...register('clienteNombre')}
                  />
                  {formErrorsHook.clienteNombre && <span className={s.errorText}>{formErrorsHook.clienteNombre.message as string}</span>}
                </div>
              </div>
              <div className={s.formRow}>
                <div className={s.field}>
                  <label htmlFor="cliente-email" className={s.label}>Email</label>
                  <input id="cliente-email" className={s.input} placeholder="Email" {...register('clienteEmail')} />
                  {formErrorsHook.clienteEmail && <span className={s.errorText}>{formErrorsHook.clienteEmail.message as string}</span>}
                </div>
                <div className={s.field}>
                  <label htmlFor="cliente-telefono" className={s.label}>Teléfono</label>
                  <input id="cliente-telefono" className={s.input} placeholder="Teléfono" {...register('clienteTelefono')} />
                </div>
              </div>
            </div>
          )}

           {stepperStep === 2 && (
              <div className={s.sectionBlock}>
                <div className={s.sectionHeader}>
                  <Package size={18} />
                  <div className={s.sectionTitle}>Producto y personalización</div>
                </div>
                <p className={s.sectionDescription}>Configura cada producto por separado. Selecciona un producto para editar sus detalles y personalizaciones.</p>

                {/* Selector de productos */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {itemFields.map((item, idx) => {
                    const persCount = (item.personalizaciones || []).length;
                    return (
                      <div
                        key={item.id}
                        onClick={() => { setActiveItemIndex(idx); setEditingPersonalizacionIndex(null); setShowPersonalizacionForm(false); }}
                        className={`${s.productCard} ${idx === activeItemIndex ? s.productCardActive : ''}`}
                        style={{ flex: '1 1 220px' }}
                      >
                        <div className={s.productCardName}>{item.productoNombre || `Producto ${idx + 1}`}</div>
                        <div className={s.productCardMeta}>
                          <span>{item.cantidad || 0} unidades</span>
                          <span>·</span>
                          <span>{persCount} personalización{persCount !== 1 ? 'es' : ''}</span>
                        </div>
                        {idx === activeItemIndex && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                            <Check size={16} className="text-blue-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className={s.btnSecondary}
                    style={{ flex: '0 0 auto', minHeight: '80px' }}
                  >
                    <PlusCircle size={18} />
                    Agregar producto
                  </button>
                </div>

                    {/* Formulario del producto activo */}
                    {itemFields[activeItemIndex] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className={s.formRowAttr4}>
                          <div className={`${s.field} ${s.colSpan2}`}>
                            <label htmlFor="producto-base" className={s.label}>Producto base <span className={s.labelRequired}>*</span></label>
                            <input
                              id="producto-base"
                              className={s.input}
                              placeholder="Escribe el nombre del producto o selecciona uno del catálogo"
                              {...register(`items.${activeItemIndex}.productoNombre` as const, { required: 'El producto es obligatorio' })}
                              list="productos-sugeridos-cliente"
                            />
                            <datalist id="productos-sugeridos-cliente">
                              {productos.map(p => (
                                <option key={p.id} value={p.nombre} />
                              ))}
                            </datalist>
                            {productos.length > 0 && <span className={s.hintText}>Sugerencias del catálogo disponibles.</span>}
                            {formErrorsHook.items?.[activeItemIndex]?.productoNombre && <span className={s.errorText}>{formErrorsHook.items[activeItemIndex].productoNombre.message as string}</span>}
                          </div>
                        </div>
                    <div className={s.formRowAttr4}>
                      <div className={s.field}>
                        <label htmlFor="item-cantidad" className={s.label}>Cantidad <span className={s.labelRequired}>*</span></label>
                        <input id="item-cantidad" type="number" className={s.input} placeholder="Cantidad" {...register(`items.${activeItemIndex}.cantidad` as const, { valueAsNumber: true, required: 'La cantidad es obligatoria', min: { value: 1, message: 'La cantidad debe ser mayor a 0' } })} />
                        {formErrorsHook.items?.[activeItemIndex]?.cantidad && <span className={s.errorText}>{formErrorsHook.items[activeItemIndex].cantidad.message as string}</span>}
                      </div>
                      <div className={s.field}>
                        <label htmlFor="item-material" className={s.label}>Material/Tela</label>
                        <input id="item-material" className={s.input} placeholder="Material" {...register(`items.${activeItemIndex}.material` as const)} />
                      </div>
                    </div>

                    {/* Distribución de prendas */}
                    <div className={s.distributionSection}>
                      <div className={s.distributionHeader}>
                        <div className={s.distributionTitle}>
                          <Package size={16} />
                          Distribución de prendas
                        </div>
                      </div>
                      <div className={s.distributionGrid}>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((talla) => (
                          <div key={talla} className={s.distributionItem}>
                            <label className={s.distributionLabel}>{talla}</label>
                            <input
                              className={s.distributionInput}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={watch(`items.${activeItemIndex}.distribucionTallas.${talla}`) || ''}
                               onChange={(e) => {
                                 const val = e.target.value ? Number(e.target.value) : null;
                                 setValue(`items.${activeItemIndex}.distribucionTallas.${talla}`, val as any);
                               }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className={s.distributionTotal}>
                        <span>Total</span>
                        <span className={(() => {
                          const total = Object.values(watch(`items.${activeItemIndex}.distribucionTallas`) || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
                          const cantidad = Number(watch(`items.${activeItemIndex}.cantidad`) || 0);
                          if (cantidad > 0 && total !== cantidad) {
                            return `${s.distributionTotalValue} ${s.distributionTotalValueError}`;
                          }
                          return s.distributionTotalValueSuccess;
                        })()}>
                          {Object.values(watch(`items.${activeItemIndex}.distribucionTallas`) || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)}
                        </span>
                      </div>
                    </div>

                      {/* Personalizaciones */}
                      <div className={s.personalizationSection}>
                        <div className={s.personalizationHeader}>
                          <div>
                            <div className={s.personalizationTitle}>Personalizaciones</div>
                            <div className={s.personalizationSubtitle}>
                              Agrega una o varias personalizaciones para este producto.
                            </div>
                          </div>
                          <button type="button" className={s.quotationAddLine} onClick={() => {
                            const newIndex = itemFields[activeItemIndex]?.personalizaciones?.length ?? 0;
                            agregarPersonalizacion();
                            setEditingPersonalizacionIndex(newIndex);
                            setShowPersonalizacionForm(true);
                          }}>
                            <PlusCircle size={16} />
                            <span>Agregar personalización</span>
                          </button>
                        </div>

                      {/* Formulario de personalización */}
                      {showPersonalizacionForm && (
                        <div className={s.personalizationForm}>
                          <div className={s.personalizationFormTitle}>
                            {editingPersonalizacionIndex !== null ? 'Editar personalización' : 'Nueva personalización'}
                          </div>
                          <div className={s.formRowAttr4}>
                            <div className={s.field}>
                              <label className={s.label}>Tipo <span className={s.labelRequired}>*</span></label>
                              <select
                                className={s.select}
                                value={watch(`items.${activeItemIndex}.personalizaciones.${editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length ?? 0)}.tipo`) || 'ESTAMPADO'}
                                onChange={(e) => {
                                  const idx = editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0);
                                  actualizarPersonalizacion(idx, 'tipo', e.target.value);
                                }}
                              >
                                <option value="ESTAMPADO">Estampado</option>
                                <option value="BORDADO">Bordado</option>
                                <option value="SUBLIMACION">Sublimación</option>
                                <option value="VINILO">Vinilo</option>
                                <option value="OTRO">Otro</option>
                              </select>
                            </div>
                            <div className={s.field}>
                              <label className={s.label}>Técnica</label>
                              <input
                                className={s.input}
                                placeholder="Ej: DTF, Serigrafía..."
                                value={watch(`items.${activeItemIndex}.personalizaciones.${editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length ?? 0)}.tecnica`) || ''}
                                onChange={(e) => {
                                  const idx = editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0);
                                  actualizarPersonalizacion(idx, 'tecnica', e.target.value);
                                }}
                              />
                            </div>
                          </div>
                          <div className={s.field}>
                            <label className={s.label}>Ubicación</label>
                            <div className={s.multiSelectContainer}>
                              <div className={s.multiSelectOptions}>
                                {['FRENTE', 'ESPALDA', 'MANGA_IZQUIERDA', 'MANGA_DERECHA', 'PECHO', 'OTRA'].map((option) => {
                                  const idx = editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0);
                                  const current = (watch(`items.${activeItemIndex}.personalizaciones.${idx}.ubicacion`) as string[]) || [];
                                  const isSelected = current.includes(option);
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      className={`${s.multiSelectOption} ${isSelected ? s.multiSelectOptionSelected : ''}`}
                                      onClick={() => {
                                        const next = isSelected ? current.filter((u) => u !== option) : [...current, option];
                                        actualizarPersonalizacion(idx, 'ubicacion', next);
                                      }}
                                    >
                                      {option.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className={s.field}>
                            <label className={s.label}>Descripción del diseño <span className={s.labelRequired}>*</span></label>
                            <textarea
                              className={s.textarea}
                              rows={2}
                              placeholder="Describe el diseño..."
                              value={watch(`items.${activeItemIndex}.personalizaciones.${editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length ?? 0)}.descripcion`) || ''}
                              onChange={(e) => {
                                const idx = editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0);
                                actualizarPersonalizacion(idx, 'descripcion', e.target.value);
                              }}
                            />
                          </div>
                          <div className={s.field}>
                            <label className={s.label}>Variantes a personalizar</label>
                            {(watch(`items.${activeItemIndex}.personalizaciones.${editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length ?? 0)}.variantes`) as any[] || []).map((variante: any, varIndex: number) => (
                              <div key={varIndex} className={s.formRow}>
                                <div className={s.field}>
                                  <input className={s.input} placeholder="Talla" value={variante.talla} onChange={(e) => actualizarVariante(editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0), varIndex, 'talla', e.target.value)} />
                                </div>
                                <div className={s.field}>
                                  <input className={s.input} placeholder="Color" value={variante.color} onChange={(e) => actualizarVariante(editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0), varIndex, 'color', e.target.value)} />
                                </div>
                                <div className={s.field}>
                                  <input className={s.input} type="number" min="0" placeholder="Cant." value={variante.cantidad} onChange={(e) => actualizarVariante(editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0), varIndex, 'cantidad', Number(e.target.value))} />
                                </div>
                                <div className={s.field}>
                                  <button type="button" className={s.removeFileBtn} onClick={() => eliminarVariante(editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0), varIndex)}><Trash2 size={14} /></button>
                                </div>
                              </div>
                            ))}
                            <button type="button" className={s.quotationAddLine} onClick={() => agregarVariante(editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length || 0))}>
                              <PlusCircle size={16} />
                              <span>Agregar variante</span>
                            </button>
                            <div className={s.personalizationTotal}>
                              {(() => {
                                const total = (watch(`items.${activeItemIndex}.personalizaciones.${editingPersonalizacionIndex ?? (itemFields[activeItemIndex]?.personalizaciones?.length ?? 0)}.variantes`) as any[] || []).reduce((sum: number, v: any) => sum + (Number(v.cantidad) || 0), 0);
                                const cantidad = Number(watch(`items.${activeItemIndex}.cantidad`) || 0);
                                const exceeds = cantidad > 0 && total > cantidad;
                                return (
                                  <>
                                    Total personalización: <span style={{ color: exceeds ? '#dc2626' : 'inherit' }}>
                                      {total}{exceeds ? ` (supera las ${cantidad} unidades disponibles)` : ''}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className={s.personalizationFormActions}>
                            <button type="button" className={s.quotationAddLine} onClick={() => { setShowPersonalizacionForm(false); setEditingPersonalizacionIndex(null); }}>
                              Cancelar
                            </button>
                            <button type="button" className={s.btnPrimary} onClick={() => { setShowPersonalizacionForm(false); setEditingPersonalizacionIndex(null); }}>
                              Guardar personalización
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tarjetas de personalizaciones existentes */}
                      <div className={s.personalizationCardsList}>
                        {(itemFields[activeItemIndex]?.personalizaciones || [])
                          .filter((pers: any) => {
                            const hasTipo = !!pers.tipo;
                            const hasDescripcion = !!pers.descripcion && pers.descripcion.trim() !== '';
                            const hasUbicacion = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
                            const hasVariantes = (pers.variantes || []).some((v: any) => Number(v.cantidad) > 0);
                            return hasTipo && (hasDescripcion || hasUbicacion || hasVariantes);
                          })
                          .map((pers: any, persIndex: number) => (
                          <div key={persIndex} className={s.personalizationCard}>
                            {editingPersonalizacionIndex === persIndex ? (
                              <div className={s.personalizationCardEdit}>
                                <div className={s.personalizationCardTitle}>Editar personalización</div>
                                <div className={s.formRowAttr4}>
                                  <div className={s.field}>
                                    <label className={s.label}>Tipo</label>
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
                                    <input className={s.input} value={pers.tecnica || ''} onChange={(e) => actualizarPersonalizacion(persIndex, 'tecnica', e.target.value)} />
                                  </div>
                                </div>
                                <div className={s.field}>
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
                                              const next = isSelected ? current.filter((u: string) => u !== option) : [...current, option];
                                              actualizarPersonalizacion(persIndex, 'ubicacion', next);
                                            }}
                                          >
                                            {option.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div className={s.field}>
                                  <label className={s.label}>Descripción</label>
                                  <textarea className={s.textarea} rows={2} value={pers.descripcion || ''} onChange={(e) => actualizarPersonalizacion(persIndex, 'descripcion', e.target.value)} />
                                </div>
                                <div className={s.personalizationCardActions}>
                                  <button type="button" className={s.quotationAddLine} onClick={() => setEditingPersonalizacionIndex(null)}>Cancelar</button>
                                  <button type="button" className={s.btnPrimary} onClick={() => setEditingPersonalizacionIndex(null)}>Guardar</button>
                                </div>
                              </div>
                            ) : (
                              <div className={s.personalizationCardHeader}>
                                <div>
                                  <div className={s.personalizationCardTitle}>{pers.tipo}</div>
                                  <div className={s.personalizationCardMeta}>
                                    {(pers.ubicacion || []).map((u: string) => u.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')).join(', ')}
                                  </div>
                                  <div className={s.personalizationCardDescription}>{pers.descripcion}</div>
                                  <div className={s.personalizationCardMeta}>
                                    {(() => {
                                      const total = (pers.variantes || []).reduce((sum: number, v: any) => sum + (Number(v.cantidad) || 0), 0);
                                      const cantidad = Number(watch(`items.${activeItemIndex}.cantidad`) || 0);
                                      const exceeds = cantidad > 0 && total > cantidad;
                                      return <span style={{ color: exceeds ? '#dc2626' : 'inherit' }}>{total} unidades{exceeds ? ` (supera las ${cantidad} disponibles)` : ''}</span>;
                                    })()}
                                  </div>
                                </div>
                                <div className={s.personalizationCardActions}>
                                  <button type="button" className={s.quotationAddLine} onClick={() => setEditingPersonalizacionIndex(persIndex)}>Editar</button>
                                  <button type="button" className={s.removeFileBtn} onClick={() => eliminarPersonalizacion(persIndex)}>Eliminar</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}{stepperStep === 3 && (
            <div className={s.sectionBlock}>
              <div className={s.sectionHeader}>
                <Image size={18} />
                <div className={s.sectionTitle}>Archivos y Entrega</div>
              </div>
              <p className={s.sectionDescription}>Adjunta referencias visuales y define la fecha esperada de entrega.</p>
              <div className={s.formRow}>
                <div className={`${s.field} ${s.colSpan2}`}>
                  <label htmlFor="ref-files" className={s.label}>Archivos de referencia (JPG, PNG, PDF)</label>
                  <input id="ref-files" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className={s.hiddenInput} onChange={handleFileChange} />
                  <label htmlFor="ref-files" className={s.uploadLabel}>Seleccionar archivos</label>
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
                  <label htmlFor="fecha-entrega" className={s.label}>Fecha solicitada de entrega</label>
                  <input id="fecha-entrega" type="date" className={s.input} {...register('fechaEntregaDeseada')} />
                </div>
              </div>
              <div className={s.field}>
                <label htmlFor="uso-pedido" className={s.label}>Uso del pedido</label>
                <select id="uso-pedido" className={s.select} {...register('usoFinal')}>
                  <option value="">Selecciona</option>
                  <option value="USO_PERSONAL">Uso personal</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="UNIFORME">Uniforme</option>
                  <option value="EVENTO">Evento</option>
                  <option value="REGALO">Regalo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className={s.field}>
                <label htmlFor="notas-cliente" className={s.label}>Observaciones</label>
                <textarea id="notas-cliente" className={s.textarea} placeholder="Notas adicionales..." {...register('notasCliente')} />
              </div>
             </div>
           )}

           {stepperStep === 4 && (
             <div className={s.sectionBlock}>
               <div className={s.sectionHeader}>
                 <FileText size={18} />
                 <div className={s.sectionTitle}>Resumen de la solicitud</div>
               </div>
               <p className={s.sectionDescription}>Verifica la información antes de enviar.</p>

              <div className={s.summarySection}>
                <div className={s.summaryTitle}>Cliente</div>
                <div className={s.summaryRow}><span>Nombre</span><span>{watch('clienteNombre') || '-'}</span></div>
                <div className={s.summaryRow}><span>Email</span><span>{watch('clienteEmail') || '-'}</span></div>
                <div className={s.summaryRow}><span>Teléfono</span><span>{watch('clienteTelefono') || '-'}</span></div>
              </div>

                 <div className={s.summarySection}>
                   <div className={s.summaryTitle}>Productos</div>
                     {(watch('items') || []).map((item: any, idx: number) => {
                       const distribucion = Object.entries(item.distribucionTallas || {}).filter(([, v]) => Number(v as any) > 0) as [string, number][];
                       const totalDistribucion = distribucion.reduce((sum: number, [, v]) => sum + v, 0);
                       const totalPersonalizado = (item.personalizaciones || []).reduce((sum: number, pers: any) => sum + (pers.variantes || []).reduce((s: number, v: any) => s + (Number(v.cantidad) || 0), 0), 0);
                      return (
                         <div key={item.id || idx} className={s.summaryProductCard}>
                           <div className={s.summaryProductTitle}>Producto #{idx + 1}: {item.productoNombre || item.descripcion || 'Sin nombre'}</div>
                           <div className={s.summaryRow}><span>Cantidad</span><span>{item.cantidad || '-'}</span></div>
                           <div className={s.summaryRow}><span>Material</span><span>{item.material || '-'}</span></div>
                           {(!item.personalizaciones || item.personalizaciones.length === 0) && (
                             <>
                               <div className={s.summaryRow}><span>Tipo</span><span>{item.tipoPersonalizacion || '-'}</span></div>
                               <div className={s.summaryRow}><span>Descripción</span><span>{item.descripcion || item.productoNombre || '-'}</span></div>
                             </>
                           )}
                         {distribucion.length > 0 && (
                           <>
                             <div className={s.summarySubTitle}>Distribución de prendas</div>
                             {distribucion.map(([talla, cant]) => (
                               <div key={talla} className={s.summaryRow}><span>{talla}</span><span>{cant}</span></div>
                             ))}
                             <div className={s.summaryRow}><span>Total</span><span>{totalDistribucion}</span></div>
                           </>
                         )}
                         {(() => {
                           const validPersonalizaciones = (item.personalizaciones || []).filter((pers: any) => {
                             const hasTipo = !!pers.tipo;
                             const hasDescripcion = !!pers.descripcion && pers.descripcion.trim() !== '';
                             const hasUbicacion = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
                             const hasVariantes = (pers.variantes || []).some((v: any) => Number(v.cantidad) > 0);
                             return hasTipo && (hasDescripcion || hasUbicacion || hasVariantes);
                           });
                           if (validPersonalizaciones.length === 0) return null;
                           return (
                             <>
                               <div className={s.summarySubTitle}>Personalizaciones</div>
                               {validPersonalizaciones.map((pers: any, pIdx: number) => {
                                 const varianteTotal = (pers.variantes || []).reduce((sum: number, v: any) => sum + (Number(v.cantidad) || 0), 0);
                                 return (
                                   <div key={pIdx} className={s.summaryPersonalizationCard}>
                                     <div className={s.summaryPersonalizationTitle}>{pers.tipo}</div>
                                     <div className={s.summaryPersonalizationMeta}>
                                       {(pers.ubicacion || []).map((u: string) => u.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')).join(', ') || '-'}
                                     </div>
                                     <div className={s.summaryPersonalizationDescription}>{pers.descripcion || '-'}</div>
                                     {(pers.variantes || []).length > 0 && (
                                       <div className={s.summaryPersonalizationVariants}>
                                         {(pers.variantes || []).map((variante: any, vIdx: number) => (
                                           <div key={vIdx} className={s.summaryRow}>
                                             <span>{variante.talla || '-'} / {variante.color || '-'}</span>
                                             <span>{Number(variante.cantidad) || 0}</span>
                                           </div>
                                         ))}
                                       </div>
                                     )}
                                     <div className={s.summaryPersonalizationTotal}>
                                       {varianteTotal} unidad{varianteTotal !== 1 ? 'es' : ''}
                                     </div>
                                   </div>
                                 );
                               })}
                             </>
                           );
                         })()}
                        </div>
                      );
                    })}
                </div>

              <div className={s.summarySection}>
                <div className={s.summaryTitle}>Entrega</div>
                <div className={s.summaryRow}><span>Fecha solicitada</span><span>{watch('fechaEntregaDeseada') ? new Date(watch('fechaEntregaDeseada') as string).toLocaleDateString('es-CO') : '-'}</span></div>
                <div className={s.summaryRow}><span>Uso</span><span>{watch('usoFinal') || '-'}</span></div>
                <div className={s.summaryRow}><span>Observaciones</span><span>{watch('notasCliente') || '-'}</span></div>
              </div>
            </div>
          )}
        </form>
      </CustomOrderFormModal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar solicitud"
        description={`¿Estás seguro de que deseas eliminar la solicitud "${deleteConfirm?.numeroSolicitud}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <Modal open={!!rejectConfirm} onClose={() => { setRejectConfirm(null); setRejectReason(''); }} title="Rechazar cotización" description="Indica el motivo del rechazo. Esta acción no se puede deshacer." size="md" variant="form">
        {rejectConfirm && (
          <div className={s.form}>
            <div className={s.registroInfo}>
              <div className={s.formRow}>
                <div className={s.field}>
                  <span className={s.label}>Solicitud</span>
                  <span className={s.infoValue}>{rejectConfirm.numeroSolicitud}</span>
                </div>
                <div className={s.field}>
                  <span className={s.label}>Cliente</span>
                  <span className={s.infoValue}>{rejectConfirm.clienteNombre}</span>
                </div>
              </div>
            </div>
            <div className={s.field}>
              <label htmlFor="reject-reason" className={s.label}>Motivo del rechazo <span className={s.labelRequired}>*</span></label>
              <textarea
                id="reject-reason"
                className={s.textarea}
                rows={3}
                placeholder="Explica por qué rechazas esta cotización..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <ModalFooter
              actions={[
                { label: 'Cancelar', variant: 'secondary', onClick: () => { setRejectConfirm(null); setRejectReason(''); } },
                { label: 'Rechazar cotización', variant: 'danger', onClick: confirmRejectQuotation, disabled: !rejectReason.trim() },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal open={uploadPaymentOpen} onClose={() => setUploadPaymentOpen(false)} title="Subir comprobante de pago" description="Adjunta el comprobante del anticipo para que el equipo lo verifique." size="md" variant="form">
        {uploadPaymentOrderId && (
          <div className={s.form}>
            <div className={s.field}>
              <label htmlFor="payment-proof-upload" className={s.label}>Comprobante (JPG, PNG, PDF)</label>
              <input id="payment-proof-upload" type="file" accept="image/*,.pdf" className={s.hiddenInput} onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPaymentProofFile(file);
                setPaymentProofUrl(URL.createObjectURL(file));
              }} />
              <label htmlFor="payment-proof-upload" className={s.uploadLabel}>
                <FileText size={18} />
                <span>{paymentProofUrl ? 'Cambiar comprobante' : 'Seleccionar comprobante'}</span>
              </label>
              {paymentProofUrl && (
                <div className={s.filePreview}>
                  <div className={s.fileChip}>
                    {paymentProofFile?.type.startsWith('image/') && paymentProofUrl ? (
                      <img src={paymentProofUrl} alt={paymentProofFile?.name ?? 'comprobante'} className={s.fileChipImage} />
                    ) : (
                      <FileText size={16} />
                    )}
                    <span className={s.fileChipName}>{paymentProofFile?.name ?? 'comprobante'}</span>
                    <button type="button" className={s.removeFileBtn} onClick={() => { setPaymentProofFile(null); setPaymentProofUrl(''); }}>Eliminar</button>
                  </div>
                </div>
              )}
              <span className={s.hintText}>Adjunta el comprobante del anticipo (imagen o PDF).</span>
            </div>
            <ModalFooter
              actions={[
                { label: 'Cancelar', variant: 'secondary', onClick: () => setUploadPaymentOpen(false) },
                { label: 'Subir comprobante', onClick: async () => {
                  if (!uploadPaymentOrderId || !paymentProofFile) {
                    toast.error('Selecciona un comprobante');
                    return;
                  }
                  try {
                    const result = await customOrdersApi.uploadPaymentProof(uploadPaymentOrderId, paymentProofFile);
                    await customOrdersApi.clientUpdate(uploadPaymentOrderId, { paymentProofUrl: result.paymentProofUrl, paymentStatus: 'PENDING' });
                    toast.success('Comprobante subido correctamente');
                    setUploadPaymentOpen(false);
                    void loadOrders();
                  } catch {
                    toast.error('Error al subir comprobante');
                  }
                } },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
