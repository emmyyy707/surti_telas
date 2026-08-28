import { NotFoundError, ConflictError, BadRequestError } from '../../../../shared/domain/errors';
import type { CustomOrderFilters, CustomOrderRepository, QuotationRepository, CustomOrderHistoryRepository } from '../../domain/repositories/CustomOrderRepository';
import { PedidoPersonalizado } from '../../domain/entities/PedidoPersonalizado';
import { CustomOrderStatus, QuotationStatus } from '../../domain/value-objects/CustomOrderStatus';
import { PrismaClient } from '@prisma/client';
import type { EventBus } from '../../../../shared/application/events';
import { CustomOrderCreatedEvent, CustomOrderSubmittedEvent, QuotationGeneratedEvent, QuotationAcceptedEvent, QuotationRejectedEvent, CustomOrderConvertedEvent, CustomOrderStatusUpdatedEvent, CustomOrderUpdatedEvent, CustomOrderDeletedEvent, CustomOrderPaymentUpdatedEvent } from '../../../../shared/application/events';

export class ListCustomOrders {
  constructor(private readonly repo: CustomOrderRepository) {}
  execute(filters: CustomOrderFilters = {}) {
    return this.repo.list(filters);
  }
}

export class GetCustomOrder {
  constructor(private readonly repo: CustomOrderRepository) {}
  async execute(id: string) {
    const order = await this.repo.getById(id);
    if (!order) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    return order;
  }
}

export class CreateCustomOrder {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus
  ) {}

  private normalizeUbicacion(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') return value.split(',').map((u) => u.trim()).filter(Boolean);
    return [];
  }

  async execute(input: any) {
    const numero = await this.repo.nextNumero();

    if (input.items && input.items.length > 0) {
      for (const item of input.items) {
        const cantidad = Number(item.cantidad) || 0;
        if (item.distribucionTallas && Object.keys(item.distribucionTallas).length > 0) {
          const suma = Object.values(item.distribucionTallas).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
          if (suma !== cantidad) {
            throw new ConflictError(`La distribuci贸n de tallas (${suma}) no coincide con la cantidad total (${cantidad})`);
          }
        }
        if (item.distribucionColores && Object.keys(item.distribucionColores).length > 0) {
          const suma = Object.values(item.distribucionColores).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
          if (suma !== cantidad) {
            throw new ConflictError(`La distribuci贸n de colores (${suma}) no coincide con la cantidad total (${cantidad})`);
          }
        }
      }
    }

    const pedido = new PedidoPersonalizado({
      ...input,
      numeroSolicitud: numero,
      estado: CustomOrderStatus.PENDIENTE,
      items: [],
      personalizaciones: [],
    });

    let created: any = null;
    await this.prisma.$transaction(async (tx) => {
      created = await this.repo.create(pedido, tx);

      if (input.items && input.items.length > 0) {
        for (let index = 0; index < input.items.length; index++) {
          const item = input.items[index];
      const savedItem = await tx.custom_order_items.create({
        data: {
          custom_order_id: created.id!,
          producto_id: item.productoId ?? null,
          producto_nombre: item.productoNombre ?? null,
          descripcion: item.descripcion || 'Item',
          tipo_personalizacion: item.tipoPersonalizacion || 'OTRO',
          especificaciones: item.especificaciones ?? null,
          cantidad: Number(item.cantidad ?? 0),
          talla: item.talla ?? null,
          color: item.color ?? null,
          material: item.material ?? null,
          ubicacion: this.normalizeUbicacion(item.ubicacion),
          distribucion_tallas: item.distribucionTallas ?? null,
          imagenes_referencia: item.imagenesReferencia ?? [],
          orden: item.orden ?? index,
        } as any,
      });
      console.log('[backend][createItem] saved distribucion_tallas', savedItem.distribucion_tallas, 'imagenes_referencia', savedItem.imagenes_referencia);

          if (item.personalizaciones && item.personalizaciones.length > 0) {
            for (const pers of item.personalizaciones) {
              const savedPers = await tx.personalizations.create({
                data: {
                  custom_order_item_id: savedItem.id,
                  tipo: pers.tipo,
                  tecnica: pers.tecnica ?? null,
                  ubicacion: this.normalizeUbicacion(pers.ubicacion),
                  descripcion: pers.descripcion,
                  archivos: pers.archivos ?? [],
                  orden: pers.orden ?? 0,
                } as any,
              });

              if (pers.variantes && pers.variantes.length > 0) {
                await tx.variants.createMany({
                  data: pers.variantes.map((v: any) => ({
                    custom_order_personalization_id: savedPers.id,
                    talla: v.talla,
                    color: v.color,
                    cantidad: Number(v.cantidad ?? 0),
                  })),
                });
              }
            }
          }
        }
      }

      if (input.personalizaciones && input.personalizaciones.length > 0) {
        const personalizaciones = input.personalizaciones.map((p: any) => ({
          ...p,
          pedidoPersonalizadoId: created.id!,
        }));
        await tx.custom_order_notes.createMany({
          data: personalizaciones as any,
        });
      }
    });

    const full = await this.repo.getById(created.id);

    if (this.eventBus && full) {
      this.eventBus.publish(new CustomOrderCreatedEvent({
        customOrderId: full.id,
        numeroSolicitud: full.numeroSolicitud,
        clienteId: full.clienteId,
        clienteNombre: full.clienteNombre,
        asesorId: full.asesorId ?? undefined,
        asesorNombre: full.asesorNombre ?? undefined,
        itemsCount: full.items?.length ?? 0,
      }));
    }

    return full!;
  }
}

export class UpdateCustomOrder {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus,
  ) {}

  private normalizeUbicacion(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') return value.split(',').map((u) => u.trim()).filter(Boolean);
    return [];
  }

  async execute(id: string, changes: any, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const { items, ...cabecera } = changes;

    await this.repo.update(id, cabecera);

    if (items && Array.isArray(items) && items.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        await tx.custom_order_items.updateMany({
          where: { custom_order_id: id, deleted_at: null },
          data: { deleted_at: new Date() },
        });

        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const savedItem = await tx.custom_order_items.create({
            data: {
              custom_order_id: id,
              producto_id: item.productoId ?? null,
              producto_nombre: item.productoNombre ?? null,
              descripcion: item.descripcion || 'Item',
              tipo_personalizacion: item.tipoPersonalizacion || 'OTRO',
              especificaciones: item.especificaciones ?? null,
              cantidad: Number(item.cantidad ?? 0),
              talla: item.talla ?? null,
              color: item.color ?? null,
              material: item.material ?? null,
              ubicacion: this.normalizeUbicacion(item.ubicacion),
              distribucion_tallas: item.distribucionTallas ?? null,
              imagenes_referencia: item.imagenesReferencia ?? [],
              orden: item.orden ?? index,
            } as any,
          });

          if (item.personalizaciones && item.personalizaciones.length > 0) {
            for (const pers of item.personalizaciones) {
              const savedPers = await tx.personalizations.create({
                data: {
                  custom_order_item_id: savedItem.id,
                  tipo: pers.tipo,
                  tecnica: pers.tecnica ?? null,
                  ubicacion: this.normalizeUbicacion(pers.ubicacion),
                  descripcion: pers.descripcion,
                  archivos: pers.archivos ?? [],
                  orden: pers.orden ?? 0,
                } as any,
              });

              if (pers.variantes && pers.variantes.length > 0) {
                await tx.variants.createMany({
                  data: pers.variantes.map((v: any) => ({
                    custom_order_personalization_id: savedPers.id,
                    talla: v.talla,
                    color: v.color,
                    cantidad: Number(v.cantidad ?? 0),
                  })),
                });
              }
            }
          }
        }
      });
    }

    const updated = await this.repo.getById(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new CustomOrderUpdatedEvent({
          customOrderId: id,
          numeroSolicitud: updated.numeroSolicitud,
          cambios: cabecera,
          clienteId: updated.clienteId,
          clienteNombre: updated.clienteNombre,
          asesorId: updated.asesorId ?? undefined,
          asesorNombre: updated.asesorNombre ?? undefined,
        }, requestId)
      );
    }

    return updated;
  }
}

export class SubmitForReview {
  constructor(private readonly repo: CustomOrderRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    if (existing.estado !== CustomOrderStatus.PENDIENTE && existing.estado !== CustomOrderStatus.SOLICITUD_RECIBIDA) {
      throw new ConflictError('La solicitud ya fue enviada a revisi贸n');
    }

    const items = await this.prisma.custom_order_items.findMany({
      where: { custom_order_id: id, deleted_at: null },
    });
    if (items.length === 0) {
      throw new ConflictError('Debe incluir al menos un item en la solicitud');
    }

    const updated = await this.repo.update(id, { estado: CustomOrderStatus.ACEPTADO });

    if (this.eventBus) {
      this.eventBus.publish(new CustomOrderSubmittedEvent({
        customOrderId: updated.id,
        numeroSolicitud: updated.numeroSolicitud,
        clienteId: updated.clienteId,
        clienteNombre: updated.clienteNombre,
      }));
    }

    return updated;
  }
}

export class GenerateQuotation {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus
  ) {}

  async execute(pedidoPersonalizadoId: string, input: any) {
    const pedido = await this.repo.getById(pedidoPersonalizadoId);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const existing = await this.quotationRepo.getByPedidoId(pedidoPersonalizadoId);
    if (existing && existing.estado !== QuotationStatus.BORRADOR && existing.estado !== QuotationStatus.VENCIDA && existing.estado !== QuotationStatus.PENDIENTE && existing.estado !== QuotationStatus.RECHAZADA) {
      throw new ConflictError('Ya existe una cotizaci髇 enviada o aceptada para esta solicitud');
    }

    const subtotal = input.detalles.reduce((sum: number, d: any) => sum + (Number(d.subtotal) || 0), 0);
    const impuestos = Number(input.impuestos ?? 0);
    const descuento = Number(input.descuento ?? 0);
    const total = Number((subtotal + impuestos - descuento).toFixed(2));
    const porcentajeAnticipo = Number(input.porcentajeAnticipo ?? 50);
    const valorAnticipo = Number((total * (porcentajeAnticipo / 100)).toFixed(2));
    const saldo = Number((total - valorAnticipo).toFixed(2));

    const numeroCotizacion = existing
      ? existing.numeroCotizacion
      : await this.quotationRepo.nextNumero();

    const negotiationCount = existing?.negotiationCount ?? 0;
    const estado = input.draft ? QuotationStatus.PENDIENTE : QuotationStatus.ENVIADA;

    const cotizacionData = {
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      pedidoPersonalizadoId,
      numeroCotizacion,
      estado,
      subtotal,
      impuestos,
      descuento,
      total,
      tiempoEstimadoDias: input.tiempoEstimadoDias,
      validaHasta: input.validaHasta,
      condicionesPago: input.condicionesPago,
      porcentajeAnticipo,
      valorAnticipo,
      saldo,
      observaciones: input.observaciones,
      generadoPorId: input.generadoPorId,
      generadoPorNombre: input.generadoPorNombre,
      detalles: input.detalles,
      negotiationCount: negotiationCount,
    };

    const result = await this.prisma.$transaction(async (tx) => {
      let cotizacion: any;
      if (existing) {
        await tx.quote_items.deleteMany({
          where: { quote_id: existing.id },
        });
        cotizacion = await this.quotationRepo.update(existing.id, cotizacionData, tx);
      } else {
        cotizacion = await this.quotationRepo.create(cotizacionData, tx);
      }

      await tx.quote_items.createMany({
        data: input.detalles.map((d: any) => ({
          id: `${cotizacion.id}-${Math.random().toString(36).slice(2, 9)}`,
          quote_id: cotizacion.id,
          custom_order_item_id: d.customOrderItemId ?? null,
          concepto: d.descripcion,
          tipo: d.tipo,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          unidad_medida: d.unidadMedida,
          precio_unitario: d.precioUnitario,
          subtotal: d.subtotal,
          observaciones: d.observaciones,
          orden: d.orden ?? 0,
        })) as any,
      });

      await this.repo.update(pedidoPersonalizadoId, {
        estado: CustomOrderStatus.COTIZADO,
      }, tx);

      return { pedido, cotizacion };
    });

    const pedidoActualizado = await this.repo.getById(pedidoPersonalizadoId);
    const cotizacionCompleta = await this.quotationRepo.getByPedidoId(pedidoPersonalizadoId);

    if (this.eventBus && cotizacionCompleta && pedidoActualizado) {
      this.eventBus.publish(new QuotationGeneratedEvent({
        customOrderId: pedidoActualizado.id,
        numeroSolicitud: pedidoActualizado.numeroSolicitud,
        numeroCotizacion: cotizacionCompleta.numeroCotizacion,
        clienteId: pedidoActualizado.clienteId,
        clienteNombre: pedidoActualizado.clienteNombre,
        total: Number(cotizacionCompleta.total ?? 0),
        valorAnticipo: Number(cotizacionCompleta.valorAnticipo ?? 0),
        saldo: Number(cotizacionCompleta.saldo ?? 0),
        draft: input.draft ?? false,
      }));
    }

    return { pedido: pedidoActualizado ?? result.pedido, cotizacion: cotizacionCompleta ?? result.cotizacion };
  }
}

export class AcceptQuotation {
  constructor(private readonly repo: CustomOrderRepository, private readonly quotationRepo: QuotationRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(id: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotizaci贸n no encontrada');
    if (cotizacion.estado !== QuotationStatus.ENVIADA) {
      throw new ConflictError('La cotizaci贸n debe estar en estado ENVIADA para aceptarse');
    }
    if (cotizacion.validaHasta && new Date(cotizacion.validaHasta) < new Date()) {
      throw new ConflictError('La cotizaci贸n ha vencido');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.quotationRepo.update(cotizacion.id, {
        estado: QuotationStatus.ACEPTADA,
        respondidaEn: new Date(),
      }, tx);

      await this.repo.update(id, {
        estado: CustomOrderStatus.PAGO_PENDIENTE,
        fechaAceptacion: new Date(),
      }, tx);
    });

    const updated = await this.repo.getById(id);

    if (this.eventBus && updated && cotizacion) {
      const total = Number(cotizacion.total ?? 0);
      const valorAnticipo = Number(cotizacion.valorAnticipo ?? 0);
      this.eventBus.publish(new QuotationAcceptedEvent({
        customOrderId: updated.id,
        numeroSolicitud: updated.numeroSolicitud,
        numeroCotizacion: cotizacion.numeroCotizacion,
        clienteId: updated.clienteId,
        clienteNombre: updated.clienteNombre,
        total,
        valorAnticipo,
      }));
    }

    return updated;
  }
}

export class RejectQuotation {
  constructor(private readonly repo: CustomOrderRepository, private readonly quotationRepo: QuotationRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(id: string, motivoRechazo: string, rechazadoPor?: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotizaci髇 no encontrada');
    if (cotizacion.estado !== QuotationStatus.ENVIADA) {
      throw new ConflictError('La cotizaci髇 debe estar en estado ENVIADA para rechazarse');
    }

    const negotiationCount = (cotizacion.negotiationCount ?? 0) + 1;
    const maxNegotiations = 3;
    const nuevoEstado = negotiationCount >= maxNegotiations ? QuotationStatus.CANCELADA : QuotationStatus.RECHAZADA;

    const historyEntry = {
      step: negotiationCount,
      reason: motivoRechazo,
      date: new Date().toISOString(),
      user: rechazadoPor ?? 'Cliente',
    };

    await this.prisma.$transaction(async (tx) => {
      await this.quotationRepo.update(cotizacion.id, {
        estado: nuevoEstado,
        respondidaEn: new Date(),
        motivo_rechazo: motivoRechazo,
        negotiationCount,
        negotiationHistory: [...(cotizacion.negotiationHistory ?? []), historyEntry],
      }, tx);

      await this.repo.update(id, {
        estado: nuevoEstado === QuotationStatus.CANCELADA ? CustomOrderStatus.CANCELADO : CustomOrderStatus.COTIZACION_RECHAZADA,
        motivoRechazo,
      }, tx);
    });

    const updated = await this.repo.getById(id);

    if (this.eventBus && updated && cotizacion) {
      this.eventBus.publish(new QuotationRejectedEvent({
        customOrderId: updated.id,
        numeroSolicitud: updated.numeroSolicitud,
        numeroCotizacion: cotizacion.numeroCotizacion,
        clienteId: updated.clienteId,
        clienteNombre: updated.clienteNombre,
        motivoRechazo,
      }));
    }

    return updated;
  }
}

export interface QuotationItemDecisionInput {
  acceptedIds: string[];
  rejectedItems: Array<{
    detalleId: string;
    reason: string;
    comment?: string;
  }>;
}

export interface ProductDecisionInput {
  acceptedProductIds: string[];
  rejectedProducts: Array<{
    productId: string;
    reason: string;
    comment?: string;
  }>;
}

export interface AcceptQuotationDecisionsResult {
  customOrderId: string;
  quotationStatus: string;
  acceptedItems: Array<{ id: string; descripcion: string; subtotal: number }>;
  rejectedItems: Array<{ id: string; descripcion: string; reason: string; comment?: string }>;
  totalAccepted: number;
  orderId?: string;
}

function groupQuoteItemsByProduct(quoteItems: Array<{ id: string; custom_order_item_id?: string | null; [key: string]: any }>): Map<string, Array<{ id: string; custom_order_item_id?: string | null; [key: string]: any }>> {
  const productMap = new Map<string, Array<{ id: string; custom_order_item_id?: string | null; [key: string]: any }>>();

  for (const item of quoteItems) {
    const productId = item.custom_order_item_id ?? `unattached-${item.id}`;
    if (!productMap.has(productId)) {
      productMap.set(productId, []);
    }
    productMap.get(productId)!.push(item);
  }

  return productMap;
}

export class AcceptQuotationWithDecisions {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus
  ) {}

  async execute(id: string, decisions: QuotationItemDecisionInput | ProductDecisionInput): Promise<AcceptQuotationDecisionsResult> {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotizaci髇 no encontrada');
    if (cotizacion.estado !== QuotationStatus.ENVIADA) {
      throw new ConflictError('La cotizaci髇 debe estar en estado ENVIADA para aceptarse');
    }
    if (cotizacion.validaHasta && new Date(cotizacion.validaHasta) < new Date()) {
      throw new ConflictError('La cotizaci髇 ha vencido');
    }

    const quoteItems = await this.prisma.quote_items.findMany({
      where: { quote_id: cotizacion.id },
    });

    const productGroups = groupQuoteItemsByProduct(quoteItems);
    const allProductIds = Array.from(productGroups.keys());

    let acceptedProductIds: string[];
    let rejectedProducts: Array<{ productId: string; reason: string; comment?: string }>;

    if ('acceptedProductIds' in decisions && 'rejectedProducts' in decisions) {
      acceptedProductIds = decisions.acceptedProductIds;
      rejectedProducts = decisions.rejectedProducts;
    } else {
      const acceptedIdsSet = new Set(decisions.acceptedIds);
      const rejectedIdsSet = new Set(decisions.rejectedItems.map(r => r.detalleId));

      const productDecisionMap = new Map<string, { decision: 'ACEPTADO' | 'RECHAZADO'; reason?: string; comment?: string }>();

      for (const [productId, items] of productGroups) {
        const allAccepted = items.every(item => acceptedIdsSet.has(item.id));
        const allRejected = items.every(item => rejectedIdsSet.has(item.id));

        if (allAccepted) {
          productDecisionMap.set(productId, { decision: 'ACEPTADO' });
        } else if (allRejected) {
          const firstRejected = decisions.rejectedItems.find(r => rejectedIdsSet.has(r.detalleId));
          productDecisionMap.set(productId, {
            decision: 'RECHAZADO',
            reason: firstRejected?.reason,
            comment: firstRejected?.comment,
          });
        } else {
          const firstItem = items[0];
          if (acceptedIdsSet.has(firstItem.id)) {
            productDecisionMap.set(productId, { decision: 'ACEPTADO' });
          } else if (rejectedIdsSet.has(firstItem.id)) {
            const rej = decisions.rejectedItems.find(r => r.detalleId === firstItem.id);
            productDecisionMap.set(productId, {
              decision: 'RECHAZADO',
              reason: rej?.reason,
              comment: rej?.comment,
            });
          }
        }
      }

      acceptedProductIds = allProductIds.filter(pid => productDecisionMap.get(pid)?.decision === 'ACEPTADO');
      rejectedProducts = allProductIds
        .filter(pid => productDecisionMap.get(pid)?.decision === 'RECHAZADO')
        .map(pid => {
          const dec = productDecisionMap.get(pid)!;
          return { productId: pid, reason: dec.reason ?? 'OTRO', comment: dec.comment };
        });
    }

    const rejectedProductIdsSet = new Set(rejectedProducts.map(r => r.productId));

    for (const productId of acceptedProductIds) {
      if (rejectedProductIdsSet.has(productId)) {
        throw new ConflictError(`El producto ${productId} no puede estar aceptado y rechazado simult醤eamente`);
      }
    }

    for (const productId of acceptedProductIds) {
      if (!productGroups.has(productId)) {
        throw new NotFoundError(`El producto cotizado ${productId} no existe en esta cotizaci髇`);
      }
    }

    for (const rejected of rejectedProducts) {
      if (!productGroups.has(rejected.productId)) {
        throw new NotFoundError(`El producto cotizado ${rejected.productId} no existe en esta cotizaci髇`);
      }
      if (!rejected.reason || rejected.reason.trim() === '') {
        throw new ConflictError('Los productos rechazados deben tener un motivo');
      }
    }

    const allDecidedProductIds = new Set([...acceptedProductIds, ...rejectedProducts.map(r => r.productId)]);
    const pendingProducts = allProductIds.filter(pid => !allDecidedProductIds.has(pid));
    if (pendingProducts.length > 0) {
      throw new ConflictError('Debe decidir sobre todos los productos de la cotizaci髇 antes de confirmar');
    }

    const alreadyDecided = await this.prisma.quote_item_decisions.findMany({
      where: { quote_id: cotizacion.id },
    });
    if (alreadyDecided.length > 0) {
      throw new ConflictError('Esta cotizaci髇 ya fue procesada');
    }

    const acceptedItems = acceptedProductIds.flatMap(pid => productGroups.get(pid) || []);
    const rejectedItems = rejectedProducts.flatMap(r => productGroups.get(r.productId) || []);

    const allRejected = acceptedItems.length === 0;

    const subtotalAccepted = acceptedItems.reduce((sum, qi) => sum + Number(qi.subtotal), 0);
    const totalCotizacion = Number(cotizacion.total);
    const descuentoProporcional = totalCotizacion > 0
      ? Number(((Number(cotizacion.descuento ?? 0) * subtotalAccepted) / totalCotizacion).toFixed(2))
      : 0;
    const impuestosProporcional = totalCotizacion > 0
      ? Number(((Number(cotizacion.impuestos ?? 0) * subtotalAccepted) / totalCotizacion).toFixed(2))
      : 0;
    const totalAccepted = Number((subtotalAccepted - descuentoProporcional + impuestosProporcional).toFixed(2));
    if (Number.isNaN(totalAccepted)) {
      console.warn('[AcceptQuotationWithDecisions] totalAccepted is NaN, falling back to subtotalAccepted');
    }
    const finalTotalAccepted = Number.isNaN(totalAccepted) ? subtotalAccepted : totalAccepted;

    let orderId: string | undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.quote_item_decisions.createMany({
        data: [
          ...acceptedItems.map(qi => ({
            quote_item_id: qi.id,
            quote_id: cotizacion.id,
            decision: 'ACEPTADO',
            decided_at: new Date(),
          })),
          ...rejectedItems.map(qi => {
            const productRejection = rejectedProducts.find(r => qi.custom_order_item_id === r.productId);
            return {
              quote_item_id: qi.id,
              quote_id: cotizacion.id,
              decision: 'RECHAZADO',
              reject_reason: productRejection?.reason,
              reject_comment: productRejection?.comment,
              decided_at: new Date(),
            };
          }),
        ],
      });

      let newQuotationStatus: string;
      let newCustomOrderStatus: string;
      let respondidaEn: Date | null = null;
      let motivoRechazo: string | null = null;

      if (allRejected) {
        newQuotationStatus = QuotationStatus.RECHAZADA;
        newCustomOrderStatus = CustomOrderStatus.COTIZACION_RECHAZADA;
        respondidaEn = new Date();
        motivoRechazo = rejectedProducts.map(r => {
          const productItems = productGroups.get(r.productId);
          const productName = productItems?.[0]?.concepto || productItems?.[0]?.descripcion || r.productId;
          return `${productName}: ${r.reason}${r.comment ? ` - ${r.comment}` : ''}`;
        }).join('; ');
      } else {
        newQuotationStatus = QuotationStatus.ACEPTADA;
        newCustomOrderStatus = CustomOrderStatus.PAGO_PENDIENTE;
        respondidaEn = new Date();
      }

      await this.quotationRepo.update(cotizacion.id, {
        estado: newQuotationStatus,
        respondidaEn,
        motivo_rechazo: motivoRechazo,
        subtotal: subtotalAccepted,
        descuentos: descuentoProporcional,
        impuestos: impuestosProporcional,
        total: finalTotalAccepted,
      }, tx);

      await this.repo.update(id, {
        estado: newCustomOrderStatus,
        motivoRechazo: motivoRechazo,
        ...(newCustomOrderStatus === CustomOrderStatus.PAGO_PENDIENTE ? { fechaAceptacion: new Date() } : {}),
      }, tx);

      if (!allRejected && acceptedItems.length > 0) {
        const asesorId = pedido.asesorId ?? await tx.user.findFirst({
          where: { role: 'ADMIN', estado: 'ACTIVO' },
          select: { id: true },
        }).then(u => u?.id).catch(() => undefined);

        if (!asesorId) {
          throw new ConflictError('No se pudo determinar el asesor responsable');
        }

        const orderNumero = `PED-${Date.now().toString().slice(-6)}`;

        const customer = await tx.customer.findUnique({
          where: { id: pedido.clienteId },
          select: { id: true },
        });

        if (!customer) {
          throw new ConflictError(`El cliente ${pedido.clienteId} no existe`);
        }

        const orderItemsData = acceptedProductIds.map(productId => {
          const items = productGroups.get(productId) || [];
          const firstItem = items[0];
          const totalProduct = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
          return {
            productId: null,
            nombre: firstItem?.concepto || firstItem?.descripcion || 'Producto personalizado',
            precio: items.length > 1 ? Math.round(totalProduct / (items.reduce((sum, i) => sum + Number(i.cantidad), 0) || 1)) : Number(firstItem?.precio_unitario ?? 0),
            cantidad: items.reduce((sum, i) => sum + Number(i.cantidad), 0),
            customOrderItemId: productId.startsWith('unattached-') ? null : productId,
          };
        });

        const order = await tx.order.create({
          data: {
            numero: orderNumero,
            clienteId: customer.id,
            clienteNombre: pedido.clienteNombre,
            asesorId,
            asesorNombre: pedido.asesorNombre ?? 'Sistema',
            tipoFlujo: 'PERSONALIZADO',
            total: finalTotalAccepted,
            itemsCount: orderItemsData.length,
            estado: 'NUEVO',
            prioridad: 'PRIORITARIO',
            items: {
              create: orderItemsData,
            },
          },
          select: { id: true, numero: true },
        });

        orderId = order.id;

        await tx.custom_orders.update({
          where: { id },
          data: { orden_id: order.id },
        });
      }
    });

    const updated = await this.repo.getById(id);

    if (this.eventBus && updated && cotizacion) {
      if (allRejected) {
        this.eventBus.publish(new QuotationRejectedEvent({
          customOrderId: updated.id,
          numeroSolicitud: updated.numeroSolicitud,
          numeroCotizacion: cotizacion.numeroCotizacion,
          clienteId: updated.clienteId,
          clienteNombre: updated.clienteNombre,
          motivoRechazo: rejectedProducts.map(r => r.reason).join(', '),
        }));
      } else {
        this.eventBus.publish(new QuotationAcceptedEvent({
          customOrderId: updated.id,
          numeroSolicitud: updated.numeroSolicitud,
          numeroCotizacion: cotizacion.numeroCotizacion,
          clienteId: updated.clienteId,
          clienteNombre: updated.clienteNombre,
          total: finalTotalAccepted,
          valorAnticipo: Number((finalTotalAccepted * 0.5).toFixed(2)),
        }));
      }
    }

    return {
      customOrderId: id,
      quotationStatus: allRejected ? 'COTIZACION_RECHAZADA' : 'COTIZACION_ACEPTADA',
      acceptedItems: acceptedItems.map(qi => ({
        id: qi.id,
        descripcion: qi.concepto || qi.descripcion || '',
        subtotal: Number(qi.subtotal),
      })),
      rejectedItems: rejectedItems.map(qi => {
        const productRejection = rejectedProducts.find(r => qi.custom_order_item_id === r.productId);
        return {
          id: qi.id,
          descripcion: qi.concepto || qi.descripcion || '',
          reason: productRejection?.reason ?? 'OTRO',
          comment: productRejection?.comment,
        };
      }),
      totalAccepted: finalTotalAccepted,
      orderId,
    };
  }
}

export class SendQuotation {
  constructor(private readonly repo: CustomOrderRepository, private readonly quotationRepo: QuotationRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, enviadoPorId?: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotizaci髇 no encontrada');
    if (cotizacion.estado !== QuotationStatus.PENDIENTE && cotizacion.estado !== QuotationStatus.BORRADOR) {
      throw new ConflictError('La cotizaci髇 debe estar en estado PENDIENTE o BORRADOR para enviarse');
    }

    const updatedCotizacion = await this.quotationRepo.update(cotizacion.id, {
      estado: QuotationStatus.ENVIADA,
      generado_por_id: enviadoPorId ?? cotizacion.generadoPorId,
    });

    const updatedPedido = await this.repo.update(id, {
      estado: CustomOrderStatus.COTIZADO,
    });

    if (this.eventBus && updatedPedido && updatedCotizacion) {
      this.eventBus.publish(new QuotationGeneratedEvent({
        customOrderId: updatedPedido.id,
        numeroSolicitud: updatedPedido.numeroSolicitud,
        numeroCotizacion: updatedCotizacion.numeroCotizacion,
        clienteId: updatedPedido.clienteId,
        clienteNombre: updatedPedido.clienteNombre,
        total: Number(updatedCotizacion.total ?? 0),
        valorAnticipo: Number(updatedCotizacion.valorAnticipo ?? 0),
        saldo: Number(updatedCotizacion.saldo ?? 0),
      }));
    }

    return updatedPedido;
  }
}

export class ConvertToOrder {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly prisma: PrismaClient,
    private readonly quotationRepo: QuotationRepository,
    private readonly eventBus?: EventBus
  ) {}

  async execute(id: string, generadoPorId?: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    if (pedido.orderId) {
      throw new ConflictError('La solicitud ya fue convertida a pedido');
    }
    if (pedido.estado !== CustomOrderStatus.PAGO_APROBADO) {
      throw new ConflictError('La solicitud debe tener el pago aprobado para convertirla a pedido');
    }

    const asesorId = generadoPorId ?? pedido.asesorId ?? await this.prisma.user.findFirst({
      where: { role: 'ADMIN', estado: 'ACTIVO' },
      select: { id: true },
    }).then(u => u?.id).catch(() => undefined);

    if (!asesorId) {
      throw new ConflictError('No se pudo determinar el asesor responsable de la conversi贸n');
    }

    const items = await this.prisma.custom_order_items.findMany({
      where: { custom_order_id: id, deleted_at: null },
      include: {
        personalizations: {
          where: { deleted_at: null },
          include: {
            variants: {
              where: { deleted_at: null },
            },
          },
        },
      },
    });

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    const allQuoteItems: any[] = cotizacion?.detalles ?? [];

    const quoteItemDecisions = await this.prisma.quote_item_decisions.findMany({
      where: { quote_id: cotizacion?.id },
    });

    const acceptedQuoteItemIds = new Set(
      quoteItemDecisions
        .filter(d => d.decision === 'ACEPTADO')
        .map(d => d.quote_item_id)
    );

    const productDecisionsMap = new Map<string, { accepted: number; total: number }>();
    for (const qi of allQuoteItems) {
      const productId = qi.customOrderItemId ?? `unattached-${qi.id}`;
      if (!productDecisionsMap.has(productId)) {
        productDecisionsMap.set(productId, { accepted: 0, total: 0 });
      }
      const stats = productDecisionsMap.get(productId)!;
      stats.total += 1;
      if (acceptedQuoteItemIds.has(qi.id)) {
        stats.accepted += 1;
      }
    }

    const acceptedProductIds = new Set<string>();
    for (const [productId, stats] of productDecisionsMap) {
      if (stats.total > 0 && stats.accepted === stats.total) {
        acceptedProductIds.add(productId);
      }
    }

    const quoteItems = acceptedProductIds.size > 0
      ? allQuoteItems.filter(qi => {
          const productId = qi.customOrderItemId ?? `unattached-${qi.id}`;
          return acceptedProductIds.has(productId);
        })
      : allQuoteItems;

    const orderNumero = `PED-${Date.now().toString().slice(-6)}`;

    const orderItemsData = quoteItems.length > 0
      ? quoteItems.map((qi: any) => ({
          productId: null,
          nombre: qi.descripcion || qi.concepto || 'Item cotizado',
          precio: Number(qi.precioUnitario ?? 0),
          cantidad: Number(qi.cantidad ?? 1),
          customOrderItemId: qi.customOrderItemId ?? null,
        }))
      : items.map((ci: any) => ({
          productId: null,
          nombre: ci.descripcion || 'Item solicitud',
          precio: 0,
          cantidad: Number(ci.cantidad ?? 1),
          customOrderItemId: ci.id,
        }));

    const totalUnidades = orderItemsData.reduce((acc: number, it: any) => acc + Number(it.cantidad || 0), 0);

    const curvaTallas = items.map((ci: any) => {
      const personalizations = ci.personalizations ?? [];
      const variants = personalizations.flatMap((p: any) => (p.variants ?? []));
      return {
        descripcion: ci.descripcion,
        cantidad: Number(ci.cantidad ?? 0),
        talla: ci.talla ?? null,
        color: ci.color ?? null,
        material: ci.material ?? null,
        tipoPersonalizacion: ci.tipo_personalizacion ?? null,
        ubicacion: ci.ubicacion ?? null,
        especificaciones: ci.especificaciones ?? null,
        variantes: variants.map((v: any) => ({
          talla: v.talla,
          color: v.color,
          cantidad: v.cantidad,
        })),
      };
    });

    const telas = Array.from(new Set(items.map((ci: any) => ci.material).filter(Boolean))) as string[];
    const colores = Array.from(new Set(items.map((ci: any) => ci.color).filter(Boolean))) as string[];

    const totalAcceptedProducts = quoteItems.reduce((sum: number, qi: any) => sum + Number(qi.subtotal ?? 0), 0);
    const totalCotizacion = acceptedProductIds.size > 0 ? totalAcceptedProducts : Number(pedido.cotizacion?.total ?? 0);
    const porcentaje = Number(pedido.cotizacion?.porcentajeAnticipo ?? 50);
    const anticipo = Number((totalCotizacion * (porcentaje / 100)).toFixed(2));

    const result = await this.prisma.$transaction(async (tx) => {
      if (!pedido.clienteId) {
        throw new BadRequestError('El pedido personalizado no tiene cliente asignado');
      }

      const customer = await tx.customer.findUnique({
        where: { id: pedido.clienteId },
        select: { id: true },
      });

      if (!customer) {
        throw new BadRequestError(`El cliente ${pedido.clienteId} no existe en la base de datos`);
      }

      const clienteId = customer.id;

      const order = await tx.order.create({
        data: {
          numero: orderNumero,
          clienteId,
          clienteNombre: pedido.clienteNombre,
          asesorId,
          asesorNombre: pedido.asesorNombre ?? 'Sistema',
          tipoFlujo: 'PERSONALIZADO',
          total: totalCotizacion,
          itemsCount: orderItemsData.length,
          estado: 'NUEVO',
          prioridad: 'PRIORITARIO',
          items: {
            create: orderItemsData.map((it: any) => ({
              productId: it.productId,
              customOrderItemId: it.customOrderItemId,
              nombre: it.nombre,
              precio: it.precio,
              cantidad: it.cantidad,
            })),
          },
        } as any,
        select: { id: true, numero: true },
      });

      if (pedido.anticipoPagado && totalCotizacion > 0) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            customerId: clienteId,
            asesorId,
            amount: anticipo,
            method: 'OTHER',
            status: 'APPROVED',
            notes: 'Anticipo pedido personalizado',
            paidAt: new Date(),
          },
        });
      }

      const fechaEstimada = new Date();
      fechaEstimada.setDate(fechaEstimada.getDate() + (pedido.cotizacion?.tiempoEstimadoDias ?? 7));

      await tx.productionOrder.create({
        data: {
          pedidoId: order.id,
          referencia: order.numero,
          cantidad: totalUnidades,
          fechaEstimada,
          avance: 0,
          estado: 'PENDIENTE',
          tela: telas.length > 0 ? telas.join(', ') : undefined,
          colores: colores.length > 0 ? colores : [],
          curvaTallas: curvaTallas.length > 0 ? curvaTallas : undefined,
          notasTecnicas: `Pedido personalizado ${pedido.numeroSolicitud}. ${pedido.descripcionGeneral ?? ''}`.trim(),
        },
      });

      await tx.custom_orders.update({
        where: { id },
        data: { estado: 'CONVERTIDO_A_PEDIDO', orden_id: order.id },
      });

      if (this.eventBus) {
        this.eventBus.publish(new CustomOrderConvertedEvent({
          customOrderId: id,
          numeroSolicitud: pedido.numeroSolicitud,
          orderId: order.id,
          orderNumero: order.numero,
          clienteId,
          clienteNombre: pedido.clienteNombre,
          total: totalCotizacion,
        }));
      }

      return {
        pedidoPersonalizadoId: id,
        orderId: order.id,
        orderNumero: order.numero,
        estado: CustomOrderStatus.CONVERTIDO_A_PEDIDO,
      };
    });

    return result;
  }
}

export class DeleteCustomOrder {
  constructor(private readonly repo: CustomOrderRepository, private readonly eventBus?: EventBus) {}

  async execute(id: string, requestId?: string) {
    const order = await this.repo.getById(id);
    if (!order) {
      throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    }
    await this.repo.remove(id);
    if (this.eventBus) {
      this.eventBus.publish(
        new CustomOrderDeletedEvent({
          customOrderId: order.id,
          numeroSolicitud: order.numeroSolicitud,
          clienteId: order.clienteId,
          clienteNombre: order.clienteNombre,
          asesorId: order.asesorId ?? undefined,
          asesorNombre: order.asesorNombre ?? undefined,
        }, requestId)
      );
    }
  }
}

export class ChangeCustomOrderStatus {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly historyRepo: CustomOrderHistoryRepository,
    private readonly eventBus?: EventBus
  ) {}

  async execute(id: string, newStatus: string, usuarioId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const previousStatus = existing.estado;
    const updated = await this.repo.update(id, { estado: newStatus });

    await this.historyRepo.create({
      customOrderId: id,
      usuarioId,
      accion: 'CAMBIAR_ESTADO',
      estadoAnterior: previousStatus,
      estadoNuevo: updated.estado,
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new CustomOrderStatusUpdatedEvent({
          customOrderId: updated.id,
          numeroSolicitud: updated.numeroSolicitud,
          previousStatus,
          newStatus: updated.estado,
          clienteId: updated.clienteId,
          clienteNombre: updated.clienteNombre,
          asesorId: updated.asesorId ?? undefined,
          asesorNombre: updated.asesorNombre ?? undefined,
        })
      );
    }

    return updated;
  }
}

export class ConfirmPaymentAndConvertToOrder {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly prisma: PrismaClient,
    private readonly quotationRepo: QuotationRepository,
    private readonly historyRepo: CustomOrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(id: string, changes: { paymentStatus?: string; anticipoPagado?: boolean; paymentProofUrl?: string; paymentKey?: string }) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    if (existing.estado !== CustomOrderStatus.PAGO_EN_VERIFICACION && existing.estado !== CustomOrderStatus.PAGO_PENDIENTE) {
      throw new ConflictError('La solicitud debe estar en estado PAGO_EN_VERIFICACION o PAGO_PENDIENTE para confirmar el pago');
    }

    await this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (changes.paymentStatus !== undefined) updateData.paymentStatus = changes.paymentStatus;
      if (changes.anticipoPagado !== undefined) updateData.anticipoPagado = changes.anticipoPagado;
      if (changes.paymentProofUrl !== undefined) updateData.paymentProofUrl = changes.paymentProofUrl || null;
      if (changes.paymentKey !== undefined) updateData.paymentKey = changes.paymentKey;

      await tx.custom_orders.update({
        where: { id },
        data: updateData,
      });

      await tx.custom_orders.update({
        where: { id },
        data: { estado: CustomOrderStatus.PAGO_APROBADO },
      });

      await this.historyRepo.create({
        customOrderId: id,
        usuarioId: undefined,
        accion: 'CONFIRMAR_PAGO',
        estadoAnterior: existing.estado,
        estadoNuevo: CustomOrderStatus.PAGO_APROBADO,
      });
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new CustomOrderPaymentUpdatedEvent({
          customOrderId: id,
          numeroSolicitud: existing.numeroSolicitud,
          cambios: changes,
          clienteId: existing.clienteId,
          clienteNombre: existing.clienteNombre ?? '',
          asesorId: existing.asesorId ?? undefined,
          asesorNombre: existing.asesorNombre ?? undefined,
        })
      );
    }

    const convertUseCase = new ConvertToOrder(this.repo, this.prisma, this.quotationRepo, this.eventBus);
    await convertUseCase.execute(id);

    const updatedOrder = await this.repo.getById(id);
    if (!updatedOrder) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    return updatedOrder;
  }
}

