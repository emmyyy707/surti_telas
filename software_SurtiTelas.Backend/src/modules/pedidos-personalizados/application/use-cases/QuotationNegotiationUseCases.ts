import { NotFoundError, ConflictError, BadRequestError } from '../../../../shared/domain/errors';
import type { CustomOrderRepository, QuotationRepository, QuotationNegotiationRepository } from '../../domain/repositories/CustomOrderRepository';
import { CustomOrderStatus, QuotationStatus } from '../../domain/value-objects/CustomOrderStatus';
import { PrismaClient } from '@prisma/client';
import type { EventBus } from '../../../../shared/application/events';
import {
  QuotationNegotiationStartedEvent,
  QuotationNegotiationRespondedEvent,
  QuotationNegotiationAcceptedEvent,
  QuotationNegotiationRejectedEvent,
  QuotationAcceptedEvent,
} from '../../../../shared/application/events';

const MAX_MESSAGES_PER_SIDE = 3;

function countByRole(negotiations: any[], role: string): number {
  return negotiations.filter((n) => n.author_role === role && n.deleted_at === null).length;
}

export class StartNegotiation {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly negotiationRepo: QuotationNegotiationRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(customOrderId: string, authorId: string, authorRole: string, message: string, proposalData?: any) {
    const pedido = await this.repo.getById(customOrderId);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(customOrderId);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');
    if (cotizacion.estado !== QuotationStatus.RECHAZADA) {
      throw new ConflictError('La cotización debe estar en estado RECHAZADA para iniciar una negociación');
    }
    if (!cotizacion.motivoRechazo) {
      throw new ConflictError('La cotización debe tener un motivo de rechazo para iniciar una negociación');
    }

    if (!['ADMIN', 'ASESOR'].includes(authorRole)) {
      throw new BadRequestError('Solo administradores o asesores pueden iniciar una negociación');
    }

    const existingNegotiations = await this.negotiationRepo.findByQuoteId(cotizacion.id);
    const adminMessages = countByRole(existingNegotiations, 'ADMIN') + countByRole(existingNegotiations, 'ASESOR');
    if (adminMessages >= MAX_MESSAGES_PER_SIDE) {
      throw new ConflictError('Se ha alcanzado el límite de mensajes de negociación para el equipo');
    }

    const round = existingNegotiations.length > 0 ? Math.max(...existingNegotiations.map((n) => n.round)) + 1 : 1;

    const negotiation = await this.negotiationRepo.create({
      quote_id: cotizacion.id,
      author_id: authorId,
      author_role: authorRole,
      message,
      round,
      proposal_data: proposalData ?? null,
      status: 'PENDING',
    });

    await this.quotationRepo.update(cotizacion.id, {
      negotiationCount: existingNegotiations.length + 1,
      estado: QuotationStatus.RECHAZADA,
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new QuotationNegotiationStartedEvent({
          customOrderId,
          quoteId: cotizacion.id,
          authorId,
          authorRole,
          message,
          round,
        })
      );
    }

    return negotiation;
  }
}

export class RespondToNegotiation {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly negotiationRepo: QuotationNegotiationRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(customOrderId: string, authorId: string, authorRole: string, message: string, proposalData?: any, parentId?: string) {
    const pedido = await this.repo.getById(customOrderId);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');

    const cotizacion = await this.quotationRepo.getByPedidoId(customOrderId);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');
    if (cotizacion.estado !== QuotationStatus.RECHAZADA && cotizacion.estado !== QuotationStatus.PENDIENTE) {
      throw new ConflictError('La cotización debe estar en estado RECHAZADA o PENDIENTE para responder');
    }

    const existingNegotiations = await this.negotiationRepo.findByQuoteId(cotizacion.id);
    if (existingNegotiations.length === 0) {
      throw new ConflictError('No hay negociaciones iniciadas para esta cotización');
    }

    const authorMessages = countByRole(existingNegotiations, authorRole);
    if (authorMessages >= MAX_MESSAGES_PER_SIDE) {
      throw new ConflictError('Se ha alcanzado el límite de mensajes de negociación para tu rol');
    }

    if (parentId) {
      const parent = existingNegotiations.find((n) => n.id === parentId);
      if (!parent) {
        throw new NotFoundError('Negociación padre no encontrada');
      }
    }

    const currentMaxRound = Math.max(...existingNegotiations.map((n) => n.round));
    const round = currentMaxRound + 1;

    const negotiation = await this.negotiationRepo.create({
      quote_id: cotizacion.id,
      author_id: authorId,
      author_role: authorRole,
      message,
      round,
      proposal_data: proposalData ?? null,
      status: 'PENDING',
    });

    await this.quotationRepo.update(cotizacion.id, {
      negotiationCount: existingNegotiations.length + 1,
    });

    if (this.eventBus) {
      this.eventBus.publish(
        new QuotationNegotiationRespondedEvent({
          customOrderId,
          quoteId: cotizacion.id,
          authorId,
          authorRole,
          message,
          round,
          proposalData,
        })
      );
    }

    return negotiation;
  }
}

export class AcceptNegotiationProposal {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly negotiationRepo: QuotationNegotiationRepository,
    private readonly prisma: PrismaClient,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(customOrderId: string, negotiationId: string, acceptedBy: string) {
    const pedido = await this.repo.getById(customOrderId);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    if (pedido.clienteId !== acceptedBy) {
      throw new BadRequestError('Solo el cliente puede aceptar una propuesta de negociación');
    }

    const cotizacion = await this.quotationRepo.getByPedidoId(customOrderId);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');
    if (cotizacion.estado !== QuotationStatus.RECHAZADA) {
      throw new ConflictError('La cotización debe estar en estado RECHAZADA para aceptar una propuesta');
    }

    const negotiation = await this.negotiationRepo.findById(negotiationId);
    if (!negotiation) throw new NotFoundError('Negociación no encontrada');
    if (negotiation.quote_id !== cotizacion.id) {
      throw new BadRequestError('La negociación no pertenece a esta cotización');
    }
    if (!negotiation.proposal_data) {
      throw new ConflictError('La negociación no contiene una propuesta para aceptar');
    }
    if (negotiation.status !== 'PENDING') {
      throw new ConflictError('La negociación ya ha sido resuelta');
    }

    const proposalData = negotiation.proposal_data as Record<string, unknown>;

    await this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        estado: QuotationStatus.ACEPTADA,
        respondida_en: new Date(),
      };
      if (proposalData.subtotal !== undefined) updateData.subtotal = proposalData.subtotal;
      if (proposalData.total !== undefined) updateData.total = proposalData.total;
      if (proposalData.descuento !== undefined) updateData.descuentos = proposalData.descuento;
      if (proposalData.impuestos !== undefined) updateData.impuestos = proposalData.impuestos;
      if (proposalData.condicionesPago !== undefined) updateData.condiciones_pago = proposalData.condicionesPago;
      if (proposalData.valorAnticipo !== undefined) updateData.valor_anticipo = proposalData.valorAnticipo;
      if (proposalData.saldo !== undefined) updateData.saldo = proposalData.saldo;
      if (proposalData.porcentajeAnticipo !== undefined) updateData.porcentaje_anticipo = proposalData.porcentajeAnticipo;
      if (proposalData.tiempoEstimadoDias !== undefined) updateData.tiempo_estimado_dias = proposalData.tiempoEstimadoDias;
      if (proposalData.validaHasta !== undefined) updateData.valida_hasta = proposalData.validaHasta;

      await this.quotationRepo.update(cotizacion.id, updateData, tx);

      await this.negotiationRepo.update(negotiation.id, { status: 'ACCEPTED' }, tx);

      await this.repo.update(customOrderId, {
        estado: CustomOrderStatus.PAGO_PENDIENTE,
        fechaAceptacion: new Date(),
      }, tx);
    });

    const updated = await this.repo.getById(customOrderId);

    if (this.eventBus && updated && cotizacion) {
      const total = Number(cotizacion.total ?? 0);
      const valorAnticipo = Number(cotizacion.valorAnticipo ?? 0);
      this.eventBus.publish(
        new QuotationNegotiationAcceptedEvent({
          customOrderId,
          quoteId: cotizacion.id,
          negotiationId,
          acceptedBy,
        })
      );
      this.eventBus.publish(
        new QuotationAcceptedEvent({
          customOrderId: updated.id,
          numeroSolicitud: updated.numeroSolicitud,
          numeroCotizacion: cotizacion.numeroCotizacion,
          clienteId: updated.clienteId,
          clienteNombre: updated.clienteNombre,
          total,
          valorAnticipo,
        })
      );
    }

    return updated;
  }
}

export class RejectNegotiationProposal {
  constructor(
    private readonly repo: CustomOrderRepository,
    private readonly quotationRepo: QuotationRepository,
    private readonly negotiationRepo: QuotationNegotiationRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(customOrderId: string, negotiationId: string, rejectedBy: string, reason?: string) {
    const pedido = await this.repo.getById(customOrderId);
    if (!pedido) throw new NotFoundError('Solicitud de pedido personalizado no encontrada');
    if (pedido.clienteId !== rejectedBy) {
      throw new BadRequestError('Solo el cliente puede rechazar una propuesta de negociación');
    }

    const cotizacion = await this.quotationRepo.getByPedidoId(customOrderId);
    if (!cotizacion) throw new NotFoundError('Cotización no encontrada');

    const negotiation = await this.negotiationRepo.findById(negotiationId);
    if (!negotiation) throw new NotFoundError('Negociación no encontrada');
    if (negotiation.quote_id !== cotizacion.id) {
      throw new BadRequestError('La negociación no pertenece a esta cotización');
    }
    if (negotiation.status !== 'PENDING') {
      throw new ConflictError('La negociación ya ha sido resuelta');
    }

    await this.negotiationRepo.update(negotiation.id, { status: 'REJECTED' });

    let clientResponse: any = negotiation;
    if (reason) {
      const existingNegotiations = await this.negotiationRepo.findByQuoteId(cotizacion.id);
      const currentMaxRound = Math.max(...existingNegotiations.map((n) => n.round));
      clientResponse = await this.negotiationRepo.create({
        quote_id: cotizacion.id,
        author_id: rejectedBy,
        author_role: 'CLIENTE',
        message: reason,
        round: currentMaxRound + 1,
        proposal_data: null,
        status: 'PENDING',
      });

      await this.quotationRepo.update(cotizacion.id, {
        negotiationCount: existingNegotiations.length + 1,
      });
    }

    if (this.eventBus) {
      this.eventBus.publish(
        new QuotationNegotiationRejectedEvent({
          customOrderId,
          quoteId: cotizacion.id,
          negotiationId,
          rejectedBy,
          reason,
        })
      );
    }

    return clientResponse;
  }
}

export class GetNegotiationHistory {
  constructor(private readonly negotiationRepo: QuotationNegotiationRepository) {}

  async execute(quoteId: string) {
    return this.negotiationRepo.findByQuoteId(quoteId);
  }
}
