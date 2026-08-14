import { NotFoundError, ConflictError, BadRequestError } from '../../../../shared/domain/errors';
import type { CustomOrderFilters, CustomOrderRepository, QuotationRepository } from '../../domain/repositories/CustomOrderRepository';
import { PedidoPersonalizado } from '../../domain/entities/PedidoPersonalizado';
import { CustomOrderStatus, QuotationStatus } from '../../domain/value-objects/CustomOrderStatus';
import { PrismaClient } from '@prisma/client';
import type { EventBus } from '../../../../shared/application/events';
import { CustomOrderCreatedEvent, CustomOrderSubmittedEvent, QuotationGeneratedEvent, QuotationAcceptedEvent, QuotationRejectedEvent, CustomOrderConvertedEvent } from '../../../../shared/application/events';

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
            throw new ConflictError(`La distribución de tallas (${suma}) no coincide con la cantidad total (${cantidad})`);
          }
        }
        if (item.distribucionColores && Object.keys(item.distribucionColores).length > 0) {
          const suma = Object.values(item.distribucionColores).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
          if (suma !== cantidad) {
            throw new ConflictError(`La distribución de colores (${suma}) no coincide con la cantidad total (${cantidad})`);
          }
        }
      }
    }

    const pedido = new PedidoPersonalizado({
      ...input,
      numeroSolicitud: numero,
      estado: CustomOrderStatus.SOLICITUD_RECIBIDA,
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
    private readonly prisma: PrismaClient
  ) {}

  private normalizeUbicacion(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') return value.split(',').map((u) => u.trim()).filter(Boolean);
    return [];
  }

  async execute(id: string, changes: any) {
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

    return await this.repo.getById(id);
  }
}

export class SubmitForReview {
  constructor(private readonly repo: CustomOrderRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    if (existing.estado !== CustomOrderStatus.SOLICITUD_RECIBIDA) {
      throw new ConflictError('La solicitud ya fue enviada a revisión');
    }

    const items = await this.prisma.custom_order_items.findMany({
      where: { custom_order_id: id, deleted_at: null },
    });
    if (items.length === 0) {
      throw new ConflictError('Debe incluir al menos un item en la solicitud');
    }

    const updated = await this.repo.update(id, { estado: CustomOrderStatus.EN_REVISION });

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
    if (existing && existing.estado !== QuotationStatus.BORRADOR && existing.estado !== QuotationStatus.VENCIDA) {
      throw new ConflictError('Ya existe una cotización enviada o aceptada para esta solicitud');
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

    const estado = existing ? (existing.estado === QuotationStatus.BORRADOR ? QuotationStatus.ENVIADA : existing.estado) : QuotationStatus.ENVIADA;

    const cotizacionData = {
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      pedidoPersonalizadoId,
      numeroCotizacion,
      estado: estado === QuotationStatus.VENCIDA ? QuotationStatus.BORRADOR : estado,
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

      const updatedPedido = await this.repo.update(pedidoPersonalizadoId, {
        estado: CustomOrderStatus.COTIZADO,
      }, tx);

      return { pedido: updatedPedido, cotizacion };
    });

    const cotizacionCompleta = await this.quotationRepo.getByPedidoId(pedidoPersonalizadoId);

    if (this.eventBus && cotizacionCompleta) {
      this.eventBus.publish(new QuotationGeneratedEvent({
        customOrderId: result.pedido.id,
        numeroSolicitud: result.pedido.numeroSolicitud,
        numeroCotizacion: cotizacionCompleta.numeroCotizacion,
        clienteId: result.pedido.clienteId,
        clienteNombre: result.pedido.clienteNombre,
        total,
        valorAnticipo,
        saldo,
      }));
    }

    return { pedido: result.pedido, cotizacion: cotizacionCompleta ?? result.cotizacion };
  }
}

export class AcceptQuotation {
  constructor(private readonly repo: CustomOrderRepository, private readonly quotationRepo: QuotationRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(id: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');
    if (cotizacion.estado !== QuotationStatus.ENVIADA) {
      throw new ConflictError('La cotización debe estar en estado ENVIADA para aceptarse');
    }
    if (cotizacion.validaHasta && new Date(cotizacion.validaHasta) < new Date()) {
      throw new ConflictError('La cotización ha vencido');
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
  async execute(id: string, motivoRechazo: string) {
    const pedido = await this.repo.getById(id);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(id);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');
    if (cotizacion.estado !== QuotationStatus.ENVIADA) {
      throw new ConflictError('La cotización debe estar en estado ENVIADA para rechazarse');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.quotationRepo.update(cotizacion.id, {
        estado: QuotationStatus.RECHAZADA,
        respondidaEn: new Date(),
        motivoRechazo,
      }, tx);

      await this.repo.update(id, {
        estado: CustomOrderStatus.COTIZACION_RECHAZADA,
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
      throw new ConflictError('No se pudo determinar el asesor responsable de la conversión');
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
    const quoteItems = cotizacion?.detalles ?? [];

    const orderNumero = `PED-${Date.now().toString().slice(-6)}`;

    const orderItemsData = quoteItems.length > 0
      ? quoteItems.map((qi: any) => ({
          productId: null,
          nombre: qi.descripcion || qi.concepto || 'Item cotizado',
          precio: Number(qi.precioUnitario ?? 0),
          cantidad: Number(qi.cantidad ?? 1),
        }))
      : items.map((ci: any) => ({
          productId: null,
          nombre: ci.descripcion || 'Item solicitud',
          precio: 0,
          cantidad: Number(ci.cantidad ?? 1),
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

    const totalCotizacion = Number(pedido.cotizacion?.total ?? 0);
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
