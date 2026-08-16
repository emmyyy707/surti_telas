import { PedidoPersonalizado } from '../../domain/entities/PedidoPersonalizado';
import { PedidoPersonalizadoItem } from '../../domain/entities/PedidoPersonalizadoItem';
import { PersonalizacionItem } from '../../domain/entities/PedidoPersonalizadoItemData';
import { Variante } from '../../domain/entities/PedidoPersonalizadoItemData';
import { Cotizacion } from '../../domain/entities/Cotizacion';

export function toPedidoPersonalizado(row: any): PedidoPersonalizado {
  const customer = row.customers ?? {};
  return new PedidoPersonalizado({
    id: row.id,
    numeroSolicitud: row.numero,
    clienteId: row.cliente_id,
    clienteNombre: [customer.nombre, customer.apellidos].filter(Boolean).join(' ').trim() || '',
    clienteEmail: customer.email ?? null,
    clienteTelefono: customer.telefono ?? null,
    asesorId: row.asesor_id,
    asesorNombre: row.users?.nombre ?? null,
    estado: row.estado,
    descripcionGeneral: row.descripcion_diseno ?? null,
    usoFinal: row.uso_final ?? null,
    fechaEntregaDeseada: row.fecha_deseada,
    fechaLimite: row.fecha_limite ?? null,
    fechaLimiteProduccion: row.fecha_limite_produccion ?? null,
    presupuestoMaximo: null,
    notasCliente: row.notas_cliente ?? null,
    notasInternas: row.notas_internas ?? null,
    notasReferencia: null,
    motivoRechazo: row.motivo_rechazo ?? null,
    fechaAceptacion: row.fecha_aceptacion ?? null,
    pedidoNormalId: null,
    orderId: row.orden_id,
    conversacionId: row.conversacion_id,
    paymentKey: row.payment_key ?? null,
    paymentProofUrl: row.payment_proof_url ?? null,
    paymentStatus: row.payment_status ?? null,
    anticipoPagado: row.anticipo_pagado ?? null,
    items: (row.custom_order_items ?? []).map((item: any) => {
      const pedidoItem = new PedidoPersonalizadoItem({
        id: item.id,
        pedidoPersonalizadoId: item.custom_order_id,
        productoId: item.producto_id,
        productoNombre: item.producto_nombre,
        descripcion: item.descripcion,
        tipoPersonalizacion: item.tipo_personalizacion,
        especificaciones: item.especificaciones,
        cantidad: item.cantidad,
        talla: item.talla,
        color: item.color,
        material: item.material,
        ubicacion: item.ubicacion,
        orden: item.orden,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
      return {
        ...pedidoItem.toDTO(),
        personalizaciones: (item.personalizations ?? []).map((p: any) => {
          const pers = new PersonalizacionItem({
            id: p.id,
            customOrderItemId: p.custom_order_item_id,
            tipo: p.tipo,
            tecnica: p.tecnica,
            ubicacion: p.ubicacion,
            descripcion: p.descripcion,
            archivos: p.archivos,
            orden: p.orden,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          });
          return {
            ...pers.toDTO(),
            variantes: (p.variants ?? []).map((v: any) => {
              const variante = new Variante({
                id: v.id,
                customOrderPersonalizationId: v.custom_order_personalization_id,
                talla: v.talla,
                color: v.color,
                cantidad: v.cantidad,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
              });
              return variante.toDTO();
            }),
          };
        }),
      };
    }),
    personalizaciones: row.custom_order_notes ?? [],
    cotizacion: row.quotes ? toCotizacionData(row.quotes) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deleted_at,
  });
}

export function toCreatePedidoInput(d: any) {
  console.log('[toCreatePedidoInput] fechaEntregaDeseada', d.fechaEntregaDeseada);
  console.log('[toCreatePedidoInput] fechaEntregaDeseada type', typeof d.fechaEntregaDeseada);
  return {
    numero: d.numeroSolicitud,
    cliente_id: d.clienteId,
    asesor_id: d.asesorId ?? null,
    estado: d.estado,
    tipo_prenda: d.tipoPrenda ?? '',
    tecnica_personalizacion: d.tecnicaPersonalizacion ?? '',
    descripcion_diseno: d.descripcionGeneral ?? null,
    referencias: d.referencias ?? [],
    telaSolicitada: d.telaSolicitada ?? null,
    colores_solicitados: d.coloresSolicitados ?? [],
    tallas: d.tallas ?? null,
    cantidad_total: d.cantidadTotal ?? 0,
    fecha_deseada: d.fechaEntregaDeseada ? new Date(d.fechaEntregaDeseada).toISOString() : null,
    fecha_limite: d.fechaLimite ?? null,
    fecha_limite_produccion: d.fechaLimiteProduccion ? new Date(d.fechaLimiteProduccion) : null,
    presupuesto_id: d.presupuestoId ?? null,
    orden_produccion_id: d.ordenProduccionId ?? null,
    orden_id: d.orderId ?? null,
    conversacion_id: d.conversacionId ?? null,
    notas_cliente: d.notasCliente ?? null,
    notas_internas: d.notasInternas ?? null,
    motivo_rechazo: d.motivoRechazo ?? null,
    fecha_aceptacion: d.fechaAceptacion ? new Date(d.fechaAceptacion) : null,
    payment_key: d.paymentKey ?? null,
    payment_proof_url: d.paymentProofUrl ?? null,
    payment_status: d.paymentStatus ?? null,
    anticipo_pagado: d.anticipoPagado ?? null,
    deleted_at: null,
  };
}

export function toUpdatePedidoInput(changes: any) {
  const data: Record<string, unknown> = {};
  if (changes.estado !== undefined) data.estado = changes.estado;
  if (changes.asesorId !== undefined) data.asesor_id = changes.asesorId;
  if (changes.descripcionGeneral !== undefined) data.descripcion_diseno = changes.descripcionGeneral;
  if (changes.fechaEntregaDeseada !== undefined) data.fecha_deseada = changes.fechaEntregaDeseada ? new Date(changes.fechaEntregaDeseada) : null;
  if (changes.orderId !== undefined) data.orden_id = changes.orderId;
  if (changes.conversacionId !== undefined) data.conversacion_id = changes.conversacionId;
  if (changes.tipoPrenda !== undefined) data.tipo_prenda = changes.tipoPrenda;
  if (changes.tecnicaPersonalizacion !== undefined) data.tecnica_personalizacion = changes.tecnicaPersonalizacion;
  if (changes.telaSolicitada !== undefined) data.telaSolicitada = changes.telaSolicitada;
  if (changes.coloresSolicitados !== undefined) data.colores_solicitados = changes.coloresSolicitados;
  if (changes.tallas !== undefined) data.tallas = changes.tallas;
  if (changes.cantidadTotal !== undefined) data.cantidad_total = changes.cantidadTotal;
  if (changes.presupuestoId !== undefined) data.presupuesto_id = changes.presupuestoId;
  if (changes.ordenProduccionId !== undefined) data.orden_produccion_id = changes.ordenProduccionId;
  if (changes.fechaLimite !== undefined) data.fecha_limite = changes.fechaLimite;
  if (changes.fechaLimiteProduccion !== undefined) data.fecha_limite_produccion = changes.fechaLimiteProduccion ? new Date(changes.fechaLimiteProduccion) : null;
  if (changes.notasCliente !== undefined) data.notas_cliente = changes.notasCliente;
  if (changes.notasInternas !== undefined) data.notas_internas = changes.notasInternas;
  if (changes.motivoRechazo !== undefined) data.motivo_rechazo = changes.motivoRechazo;
  if (changes.fechaAceptacion !== undefined) data.fecha_aceptacion = changes.fechaAceptacion ? new Date(changes.fechaAceptacion) : null;
  if (changes.paymentKey !== undefined) data.payment_key = changes.paymentKey;
  if (changes.paymentProofUrl !== undefined) data.payment_proof_url = changes.paymentProofUrl;
  if (changes.paymentStatus !== undefined) data.payment_status = changes.paymentStatus;
  if (changes.anticipoPagado !== undefined) data.anticipo_pagado = changes.anticipoPagado;
  return data;
}

export function toCotizacionData(row: any): any {
  return {
    id: row.id,
    pedidoPersonalizadoId: row.custom_order_id,
    numeroCotizacion: row.numero,
    estado: row.estado,
    subtotal: Number(row.subtotal),
    impuestos: row.impuestos ? Number(row.impuestos) : 0,
    descuento: row.descuentos ? Number(row.descuentos) : 0,
    total: Number(row.total),
    tiempoEstimadoDias: row.tiempo_estimado_dias,
    validaHasta: row.valida_hasta ? new Date(row.valida_hasta).toISOString() : null,
    condicionesPago: row.condiciones_pago,
    porcentajeAnticipo: row.porcentaje_anticipo ?? 50,
    valorAnticipo: row.valor_anticipo ? Number(row.valor_anticipo) : null,
    saldo: row.saldo ? Number(row.saldo) : null,
    observaciones: row.observaciones,
    motivoRechazo: row.motivo_rechazo,
    generadoPorId: row.generado_por_id,
    generadoPorNombre: row.generado_por_nombre,
    negotiationCount: row.negotiation_count ?? 0,
    negotiationHistory: row.negotiation_history ?? [],
    detalles: (row.quote_items ?? []).map((item: any) => ({
      id: item.id,
      tipo: item.tipo,
      concepto: item.concepto,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      unidadMedida: item.unidad_medida,
      precioUnitario: Number(item.precio_unitario),
      subtotal: Number(item.subtotal),
      observaciones: item.observaciones,
      orden: item.orden ?? 0,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toCotizacion(row: any): Cotizacion {
  return new Cotizacion(toCotizacionData(row));
}

export function toCreateCotizacionInput(d: any) {
  return {
    id: d.id,
    custom_order_id: d.pedidoPersonalizadoId,
    numero: d.numeroCotizacion,
    estado: d.estado,
    subtotal: d.subtotal,
    impuestos: d.impuestos,
    descuentos: d.descuento,
    total: d.total,
    tiempo_estimado_dias: d.tiempoEstimadoDias,
    valida_hasta: d.validaHasta,
    condiciones_pago: d.condicionesPago,
    observaciones: d.observaciones,
    motivo_rechazo: d.motivoRechazo,
    generado_por_id: d.generadoPorId,
    generado_por_nombre: d.generadoPorNombre,
    negotiation_count: d.negotiationCount ?? 0,
    negotiation_history: d.negotiationHistory ?? [],
    updatedAt: new Date(),
  };
}
