import { NotFoundError } from '../../../../shared/domain/errors';
import type { NotificationFilters, NotificationRepository } from '../../domain/repositories/NotificationRepository';
import type { EventBus } from '../../../../shared/application/events';
import { PrismaClient } from '@prisma/client';

export class GetNotifications {
  constructor(private readonly repo: NotificationRepository) {}
  execute(filters?: NotificationFilters) {
    return this.repo.list(filters);
  }
}

export class GetNotificationById {
  constructor(private readonly repo: NotificationRepository) {}
  async execute(id: string, usuarioId?: string) {
    const notification = await this.repo.getById(id, usuarioId);
    if (!notification) throw new NotFoundError('Notificación no encontrada');
    return notification;
  }
}

export class MarkNotificationAsRead {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string, usuarioId: string) {
    return this.repo.markAsRead(id, usuarioId);
  }
}

export class MarkAllNotificationsAsRead {
  constructor(private readonly repo: NotificationRepository) {}
  execute(usuarioId: string) {
    return this.repo.markAllAsRead(usuarioId);
  }
}

export class CreateNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(input: {
    tipo: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
    titulo: string;
    mensaje: string;
    usuarioId?: string;
    modulo?: string;
    referenciaId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    actorId?: string;
    targetUserId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.repo.create(input);
  }
}

export class UpdateNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string, usuarioId: string, changes: { titulo?: string; mensaje?: string; leida?: boolean; readAt?: Date }) {
    return this.repo.update(id, usuarioId, changes);
  }
}

export class DeleteNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string, usuarioId: string) {
    return this.repo.delete(id, usuarioId);
  }
}

export class NotificationSubscriber {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly prisma: PrismaClient,
  ) {}

  private async findAdmins(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', estado: 'ACTIVO', deletedAt: null },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  }

  private async findAsesorForCustomOrder(customOrderId: string): Promise<string | null> {
    const customOrder = await this.prisma.custom_orders.findUnique({
      where: { id: customOrderId, deleted_at: null },
      select: { asesor_id: true },
    });
    return customOrder?.asesor_id ?? null;
  }

  private async findOrderClients(orderId: string): Promise<{ clienteId: string; asesorId: string } | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, deletedAt: null },
      select: { clienteId: true, asesorId: true },
    });
    if (!order) return null;
    return { clienteId: order.clienteId, asesorId: order.asesorId };
  }

  private async findUserIdForCustomer(customerId: string): Promise<string | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId, deletedAt: null },
      select: { email: true },
    });
    if (!customer?.email) return null;
    const user = await this.prisma.user.findFirst({
      where: { email: customer.email, deletedAt: null },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  private async findUserIdByAnyId(userId: string): Promise<string | null> {
    if (!userId) return null;
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  private async notify(
    data: {
      tipo: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
      titulo: string;
      mensaje: string;
      modulo?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      actorId?: string;
      targetUserId?: string;
      metadata?: Record<string, unknown>;
    },
    userIds: string[],
  ): Promise<void> {
    const seen = new Set<string>();
    for (const userId of userIds) {
      if (!userId || seen.has(userId)) continue;
      seen.add(userId);
      await this.repo.create({ ...data, usuarioId: userId });
    }
  }

  register(eventBus: EventBus) {
    eventBus.subscribe('order.created', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        total: number;
        itemsCount: number;
        paymentMethod: string;
        installments?: number;
        tipoFlujo?: string;
      };

      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Nuevo pedido creado',
          mensaje: `Pedido ${payload.orderNumero} de ${payload.clienteNombre} por $${payload.total.toLocaleString()} (${payload.itemsCount} ítems)`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'CREATED',
          actorId: payload.asesorId,
          targetUserId: payload.asesorId,
          metadata: {
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            asesorId: payload.asesorId,
            asesorNombre: payload.asesorNombre,
            total: payload.total,
            itemsCount: payload.itemsCount,
            paymentMethod: payload.paymentMethod,
            installments: payload.installments,
            tipoFlujo: payload.tipoFlujo,
          },
        },
        [payload.asesorId, ...adminIds],
      );
    });

    eventBus.subscribe('order.status.updated', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        previousStatus: string;
        newStatus: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const tipoMap: Record<string, 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER'> = {
        'Cancelado': 'DANGER',
        'Entregado': 'SUCCESS',
        'En camino': 'INFO',
        'Despachado': 'INFO',
        'Listo': 'SUCCESS',
        'En producción': 'WARNING',
        'Pendiente': 'INFO',
        'Aceptado': 'SUCCESS',
        'En proceso': 'INFO',
        'Rechazado': 'DANGER',
      };

      await this.notify(
        {
          tipo: tipoMap[payload.newStatus] || 'INFO',
          titulo: `Pedido ${payload.orderNumero} actualizado`,
          mensaje: `Estado cambiado de "${payload.previousStatus}" a "${payload.newStatus}" para el cliente ${payload.clienteNombre}`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'STATUS_CHANGED',
          actorId: payload.asesorId,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
          },
        },
        [clienteUserId, payload.asesorId].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('order.delivered', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        total: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Pedido entregado',
          mensaje: `Pedido ${payload.orderNumero} entregado al cliente ${payload.clienteNombre} por $${payload.total}`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'DELIVERED',
          actorId: payload.asesorId,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            total: payload.total,
          },
        },
        [clienteUserId, payload.asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('order.canceled', async (event) => {
      const payload = event.payload as {
        orderId: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
        items: { productId: string; productRef: string; cantidad: number }[];
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'DANGER',
          titulo: 'Pedido cancelado',
          mensaje: `Pedido cancelado del cliente ${payload.clienteNombre} por $${payload.total}`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'CANCELLED',
          actorId: payload.clienteId,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            total: payload.total,
            items: payload.items,
          },
        },
        [clienteUserId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('stock.below_minimum', async (event) => {
      const payload = event.payload as {
        rawMaterialId: string;
        rawMaterialNombre: string;
        stockActual: number;
        stockMinimo: number;
      };

      await this.repo.create({
        tipo: 'WARNING',
        titulo: 'Stock bajo en insumo',
        mensaje: `El insumo "${payload.rawMaterialNombre}" tiene stock actual ${payload.stockActual} y mínimo ${payload.stockMinimo}`,
        modulo: 'INVENTORY',
        entityType: 'RAW_MATERIAL',
        entityId: payload.rawMaterialId,
        action: 'STOCK_BELOW_MINIMUM',
        metadata: {
          rawMaterialId: payload.rawMaterialId,
          rawMaterialNombre: payload.rawMaterialNombre,
          stockActual: payload.stockActual,
          stockMinimo: payload.stockMinimo,
        },
      });
    });

    eventBus.subscribe('production.completed', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        cantidad: number;
        tallerId?: string;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Producción completada',
        mensaje: `Orden de producción ${payload.referencia} (${payload.cantidad} unidades) ha sido completada`,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'COMPLETED',
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          cantidad: payload.cantidad,
          tallerId: payload.tallerId,
        },
      });
    });

    eventBus.subscribe('user.created', async (event) => {
      const payload = event.payload as {
        userId: string;
        nombre: string;
        email: string;
        role: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Usuario creado',
        mensaje: `Se creó el usuario ${payload.nombre} (${payload.email}) con rol ${payload.role}`,
        modulo: 'USERS',
        entityType: 'USER',
        entityId: payload.userId,
        action: 'CREATED',
        actorId: payload.userId,
        targetUserId: payload.userId,
        metadata: {
          userId: payload.userId,
          nombre: payload.nombre,
          email: payload.email,
          role: payload.role,
        },
      });
    });

    eventBus.subscribe('user.updated', async (event) => {
      const payload = event.payload as {
        userId: string;
        nombre?: string;
        cambios: Record<string, unknown>;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Usuario actualizado',
        mensaje: `El usuario ${payload.nombre ?? payload.userId} fue actualizado`,
        modulo: 'USERS',
        entityType: 'USER',
        entityId: payload.userId,
        action: 'UPDATED',
        actorId: payload.userId,
        targetUserId: payload.userId,
        metadata: {
          userId: payload.userId,
          nombre: payload.nombre,
          cambios: payload.cambios,
        },
      });
    });

    eventBus.subscribe('user.deleted', async (event) => {
      const payload = event.payload as {
        userId: string;
        nombre?: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Usuario eliminado',
        mensaje: `El usuario ${payload.nombre ?? payload.userId} fue eliminado`,
        modulo: 'USERS',
        entityType: 'USER',
        entityId: payload.userId,
        action: 'DELETED',
        actorId: payload.userId,
        targetUserId: payload.userId,
        metadata: {
          userId: payload.userId,
          nombre: payload.nombre,
        },
      });
    });

    eventBus.subscribe('product.created', async (event) => {
      const payload = event.payload as {
        productId: string;
        nombre: string;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Producto creado',
        mensaje: `Se creó el producto "${payload.nombre}"`,
        modulo: 'CATALOG',
        entityType: 'PRODUCT',
        entityId: payload.productId,
        action: 'CREATED',
        metadata: {
          productId: payload.productId,
          nombre: payload.nombre,
        },
      });
    });

    eventBus.subscribe('product.updated', async (event) => {
      const payload = event.payload as {
        productId: string;
        nombre: string;
        cambios: unknown;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Producto actualizado',
        mensaje: `El producto "${payload.nombre}" fue actualizado`,
        modulo: 'CATALOG',
        entityType: 'PRODUCT',
        entityId: payload.productId,
        action: 'UPDATED',
        metadata: {
          productId: payload.productId,
          nombre: payload.nombre,
          cambios: payload.cambios,
        },
      });
    });

    eventBus.subscribe('product.deleted', async (event) => {
      const payload = event.payload as {
        productId: string;
        nombre: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Producto eliminado',
        mensaje: `El producto "${payload.nombre}" fue eliminado`,
        modulo: 'CATALOG',
        entityType: 'PRODUCT',
        entityId: payload.productId,
        action: 'DELETED',
        metadata: {
          productId: payload.productId,
          nombre: payload.nombre,
        },
      });
    });

    eventBus.subscribe('order.dispatched', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        domiciliarioId?: string;
        domiciliarioNombre?: string;
        direccion: string;
        ciudad?: string;
        telefono?: string;
        total: number;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pedido despachado',
        mensaje: `Pedido ${payload.orderNumero} despachado a ${payload.domiciliarioNombre ?? 'domiciliario'} para entrega en ${payload.ciudad ?? payload.direccion}`,
        usuarioId: payload.domiciliarioId,
        modulo: 'DELIVERIES',
        entityType: 'DELIVERY',
        entityId: payload.orderId,
        action: 'ASSIGNED',
        actorId: payload.domiciliarioId,
        targetUserId: payload.domiciliarioId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          domiciliarioId: payload.domiciliarioId,
          domiciliarioNombre: payload.domiciliarioNombre,
          direccion: payload.direccion,
          ciudad: payload.ciudad,
          telefono: payload.telefono,
          total: payload.total,
        },
      });
    });

    eventBus.subscribe('order.receipt.generated', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        receiptId: string;
        total: number;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Recibo generado',
        mensaje: `Se generó el recibo para el pedido ${payload.orderNumero} por $${payload.total}`,
        usuarioId: payload.asesorId,
        modulo: 'PAYMENTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'CREATED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          receiptId: payload.receiptId,
          total: payload.total,
        },
      });
    });

    eventBus.subscribe('receipt.paid', async (event) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
        total: number;
        estado: string;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Recibo pagado',
        mensaje: `El recibo fue marcado como ${payload.estado} por $${payload.total}`,
        usuarioId: payload.customerId,
        modulo: 'PAYMENTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'PAID',
        actorId: payload.customerId,
        targetUserId: payload.customerId,
        metadata: {
          receiptId: payload.receiptId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          total: payload.total,
          estado: payload.estado,
        },
      });
    });

    eventBus.subscribe('return.created', async (event) => {
      const payload = event.payload as {
        returnId: string;
        numeroDevolucion: string;
        orderId?: string;
        orderNumero?: string;
        prenda: string;
        referencia: string;
        motivo: string;
        cantidad: number;
        clienteId?: string;
        clienteNombre?: string;
        responsable?: string;
        destino: string;
      };

      await this.repo.create({
        tipo: 'WARNING',
        titulo: 'Devolución creada',
        mensaje: `Devolución ${payload.numeroDevolucion} creada para ${payload.clienteNombre ?? 'cliente'}: ${payload.motivo}`,
        usuarioId: payload.responsable ?? payload.clienteId,
        modulo: 'RETURNS',
        entityType: 'RETURN',
        entityId: payload.returnId,
        action: 'CREATED',
        actorId: payload.responsable,
        targetUserId: payload.clienteId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          prenda: payload.prenda,
          referencia: payload.referencia,
          motivo: payload.motivo,
          cantidad: payload.cantidad,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          destino: payload.destino,
        },
      });
    });

    eventBus.subscribe('return.updated', async (event) => {
      const payload = event.payload as {
        returnId: string;
        numeroDevolucion: string;
        cambios: Record<string, unknown>;
        clienteId?: string;
        clienteNombre?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Devolución actualizada',
        mensaje: `Devolución ${payload.numeroDevolucion} fue actualizada`,
        usuarioId: payload.clienteId,
        modulo: 'RETURNS',
        entityType: 'RETURN',
        entityId: payload.returnId,
        action: 'UPDATED',
        targetUserId: payload.clienteId,
        metadata: {
          numeroDevolucion: payload.numeroDevolucion,
          cambios: payload.cambios,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
        },
      });
    });

    eventBus.subscribe('return.status.updated', async (event) => {
      const payload = event.payload as {
        returnId: string;
        numeroDevolucion: string;
        previousStatus: string;
        newStatus: string;
        clienteId?: string;
        clienteNombre?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Devolución actualizada',
        mensaje: `Estado de devolución ${payload.numeroDevolucion} cambiado de "${payload.previousStatus}" a "${payload.newStatus}"`,
        usuarioId: payload.clienteId,
        modulo: 'RETURNS',
        entityType: 'RETURN',
        entityId: payload.returnId,
        action: 'STATUS_CHANGED',
        targetUserId: payload.clienteId,
        metadata: {
          numeroDevolucion: payload.numeroDevolucion,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
        },
      });
    });

    eventBus.subscribe('return.deleted', async (event) => {
      const payload = event.payload as {
        returnId: string;
        numeroDevolucion: string;
        clienteId?: string;
        clienteNombre?: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Devolución eliminada',
        mensaje: `Devolución ${payload.numeroDevolucion} fue eliminada`,
        usuarioId: payload.clienteId,
        modulo: 'RETURNS',
        entityType: 'RETURN',
        entityId: payload.returnId,
        action: 'DELETED',
        targetUserId: payload.clienteId,
        metadata: {
          returnId: payload.returnId,
          numeroDevolucion: payload.numeroDevolucion,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
        },
      });
    });

    eventBus.subscribe('delivery.created', async (event) => {
      const payload = event.payload as {
        deliveryId: string;
        orderId: string;
        orderNumero: string;
        domiciliarioId?: string;
        domiciliarioNombre?: string;
        direccion?: string;
        ciudad?: string;
        telefono?: string;
        total: number;
      };

      const orderClients = await this.findOrderClients(payload.orderId);
      const adminIds = await this.findAdmins();
      const recipients = [payload.domiciliarioId, orderClients?.clienteId, orderClients?.asesorId, ...adminIds].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Entrega creada',
          mensaje: `Entrega creada para pedido ${payload.orderNumero}`,
          modulo: 'DELIVERIES',
          entityType: 'DELIVERY',
          entityId: payload.deliveryId,
          action: 'CREATED',
          actorId: payload.domiciliarioId,
          targetUserId: payload.domiciliarioId,
          metadata: {
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            domiciliarioId: payload.domiciliarioId,
            domiciliarioNombre: payload.domiciliarioNombre,
            direccion: payload.direccion,
            ciudad: payload.ciudad,
            telefono: payload.telefono,
            total: payload.total,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('delivery.updated', async (event) => {
      const payload = event.payload as {
        deliveryId: string;
        orderId: string;
        orderNumero: string;
        cambios: Record<string, unknown>;
      };

      const orderClients = await this.findOrderClients(payload.orderId);
      const adminIds = await this.findAdmins();
      const recipients = [orderClients?.clienteId, orderClients?.asesorId, ...adminIds].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Entrega actualizada',
          mensaje: `Entrega para pedido ${payload.orderNumero} fue actualizada`,
          modulo: 'DELIVERIES',
          entityType: 'DELIVERY',
          entityId: payload.deliveryId,
          action: 'UPDATED',
          metadata: {
            deliveryId: payload.deliveryId,
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            cambios: payload.cambios,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('delivery.status.updated', async (event) => {
      const payload = event.payload as {
        deliveryId: string;
        orderId: string;
        orderNumero: string;
        previousStatus: string;
        newStatus: string;
        domiciliarioId?: string;
        domiciliarioNombre?: string;
      };

      const orderClients = await this.findOrderClients(payload.orderId);
      const adminIds = await this.findAdmins();
      const recipients = [payload.domiciliarioId, orderClients?.clienteId, orderClients?.asesorId, ...adminIds].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Entrega actualizada',
          mensaje: `Estado de entrega para pedido ${payload.orderNumero} cambiado de "${payload.previousStatus}" a "${payload.newStatus}"`,
          modulo: 'DELIVERIES',
          entityType: 'DELIVERY',
          entityId: payload.deliveryId,
          action: 'STATUS_CHANGED',
          actorId: payload.domiciliarioId,
          targetUserId: orderClients?.clienteId,
          metadata: {
            deliveryId: payload.deliveryId,
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
            domiciliarioId: payload.domiciliarioId,
            domiciliarioNombre: payload.domiciliarioNombre,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('delivery.completed', async (event) => {
      const payload = event.payload as {
        deliveryId: string;
        orderId: string;
        orderNumero: string;
        domiciliarioId?: string;
        domiciliarioNombre?: string;
      };

      const orderClients = await this.findOrderClients(payload.orderId);
      const adminIds = await this.findAdmins();
      const recipients = [payload.domiciliarioId, orderClients?.clienteId, orderClients?.asesorId, ...adminIds].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Entrega completada',
          mensaje: `Entrega para pedido ${payload.orderNumero} completada`,
          modulo: 'DELIVERIES',
          entityType: 'DELIVERY',
          entityId: payload.deliveryId,
          action: 'COMPLETED',
          actorId: payload.domiciliarioId,
          targetUserId: orderClients?.clienteId,
          metadata: {
            deliveryId: payload.deliveryId,
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            domiciliarioId: payload.domiciliarioId,
            domiciliarioNombre: payload.domiciliarioNombre,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('customer.created', async (event) => {
      const payload = event.payload as {
        customerId: string;
        nombre: string;
        email?: string;
        ciudad: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Cliente creado',
        mensaje: `Se creó el cliente ${payload.nombre}`,
        usuarioId: payload.asesorId,
        modulo: 'CUSTOMERS',
        entityType: 'CUSTOMER',
        entityId: payload.customerId,
        action: 'CREATED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          customerId: payload.customerId,
          nombre: payload.nombre,
          email: payload.email,
          ciudad: payload.ciudad,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('customer.updated', async (event) => {
      const payload = event.payload as {
        customerId: string;
        nombre: string;
        cambios: Record<string, unknown>;
        asesorId?: string;
        asesorNombre?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Cliente actualizado',
        mensaje: `El cliente ${payload.nombre} fue actualizado`,
        usuarioId: payload.asesorId,
        modulo: 'CUSTOMERS',
        entityType: 'CUSTOMER',
        entityId: payload.customerId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          customerId: payload.customerId,
          nombre: payload.nombre,
          cambios: payload.cambios,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('payment.created', async (event) => {
      const payload = event.payload as {
        paymentId: string;
        orderId?: string;
        customerId: string;
        amount: number;
        method: string;
        status: string;
        asesorId?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pago creado',
        mensaje: `Se creó un pago por $${payload.amount.toLocaleString()} (${payload.method})`,
        usuarioId: payload.customerId,
        modulo: 'PAYMENTS',
        entityType: 'PAYMENT',
        entityId: payload.paymentId,
        action: 'CREATED',
        actorId: payload.asesorId,
        targetUserId: payload.customerId,
        metadata: {
          paymentId: payload.paymentId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          amount: payload.amount,
          method: payload.method,
          status: payload.status,
          asesorId: payload.asesorId,
        },
      });
    });

    eventBus.subscribe('payment.status.updated', async (event) => {
      const payload = event.payload as {
        paymentId: string;
        orderId?: string;
        customerId: string;
        previousStatus: string;
        newStatus: string;
        amount: number;
        asesorId?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pago actualizado',
        mensaje: `Estado del pago cambiado de "${payload.previousStatus}" a "${payload.newStatus}"`,
        usuarioId: payload.customerId,
        modulo: 'PAYMENTS',
        entityType: 'PAYMENT',
        entityId: payload.paymentId,
        action: 'STATUS_CHANGED',
        actorId: payload.asesorId,
        targetUserId: payload.customerId,
        metadata: {
          paymentId: payload.paymentId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
          amount: payload.amount,
          asesorId: payload.asesorId,
        },
      });
    });

    eventBus.subscribe('payment.updated', async (event) => {
      const payload = event.payload as {
        paymentId: string;
        orderId?: string;
        customerId: string;
        cambios: Record<string, unknown>;
        asesorId?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pago modificado',
        mensaje: `El pago fue actualizado`,
        usuarioId: payload.customerId,
        modulo: 'PAYMENTS',
        entityType: 'PAYMENT',
        entityId: payload.paymentId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId: payload.customerId,
        metadata: {
          paymentId: payload.paymentId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          cambios: payload.cambios,
          asesorId: payload.asesorId,
        },
      });
    });

    eventBus.subscribe('payment.deleted', async (event) => {
      const payload = event.payload as {
        paymentId: string;
        orderId?: string;
        customerId: string;
        asesorId?: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Pago eliminado',
        mensaje: `El pago fue eliminado`,
        usuarioId: payload.customerId,
        modulo: 'PAYMENTS',
        entityType: 'PAYMENT',
        entityId: payload.paymentId,
        action: 'DELETED',
        actorId: payload.asesorId,
        targetUserId: payload.customerId,
        metadata: {
          paymentId: payload.paymentId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          asesorId: payload.asesorId,
        },
      });
    });

    eventBus.subscribe('receipt.created', async (event) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
        numero: string;
        total: number;
        estado: string;
        emitidoPor?: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Recibo creado',
        mensaje: `Se creó el recibo ${payload.numero} por $${payload.total.toLocaleString()}`,
        usuarioId: payload.customerId,
        modulo: 'RECEIPTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'CREATED',
        actorId: payload.emitidoPor,
        targetUserId: payload.customerId,
        metadata: {
          receiptId: payload.receiptId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          numero: payload.numero,
          total: payload.total,
          estado: payload.estado,
          emitidoPor: payload.emitidoPor,
        },
      });
    });

    eventBus.subscribe('receipt.updated', async (event) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
        cambios: Record<string, unknown>;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Recibo actualizado',
        mensaje: `El recibo fue actualizado`,
        usuarioId: payload.customerId,
        modulo: 'RECEIPTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'UPDATED',
        targetUserId: payload.customerId,
        metadata: {
          receiptId: payload.receiptId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          cambios: payload.cambios,
        },
      });
    });

    eventBus.subscribe('receipt.status.updated', async (event) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
        previousStatus: string;
        newStatus: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Recibo actualizado',
        mensaje: `Estado del recibo cambiado de "${payload.previousStatus}" a "${payload.newStatus}"`,
        usuarioId: payload.customerId,
        modulo: 'RECEIPTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'STATUS_CHANGED',
        targetUserId: payload.customerId,
        metadata: {
          receiptId: payload.receiptId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
        },
      });
    });

    eventBus.subscribe('receipt.deleted', async (event) => {
      const payload = event.payload as {
        receiptId: string;
        orderId?: string;
        customerId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Recibo eliminado',
        mensaje: `El recibo fue eliminado`,
        usuarioId: payload.customerId,
        modulo: 'RECEIPTS',
        entityType: 'RECEIPT',
        entityId: payload.receiptId,
        action: 'DELETED',
        targetUserId: payload.customerId,
        metadata: {
          receiptId: payload.receiptId,
          orderId: payload.orderId,
          customerId: payload.customerId,
        },
      });
    });

    eventBus.subscribe('order.payment_proof.uploaded', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Comprobante de pago cargado',
        mensaje: `El cliente ${payload.clienteNombre} ha cargado un comprobante de pago para el pedido ${payload.orderNumero}`,
        usuarioId: payload.asesorId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'UPDATED',
        actorId: payload.clienteId,
        targetUserId: payload.asesorId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('order.accepted', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        saleId: string;
        receiptId: string;
        total: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Pedido aceptado',
          mensaje: `Tu pedido ${payload.orderNumero} ha sido aceptado. Se ha generado el recibo correspondiente.`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'STATUS_CHANGED',
          actorId: payload.asesorId,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            asesorId: payload.asesorId,
            asesorNombre: payload.asesorNombre,
            saleId: payload.saleId,
            receiptId: payload.receiptId,
            total: payload.total,
          },
        },
        [clienteUserId, payload.asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('order.rejected', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        razon: string;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'DANGER',
          titulo: 'Pedido rechazado',
          mensaje: `Tu pedido ${payload.orderNumero} ha sido rechazado. Razón: ${payload.razon}`,
          modulo: 'ORDERS',
          entityType: 'ORDER',
          entityId: payload.orderId,
          action: 'STATUS_CHANGED',
          actorId: payload.asesorId,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            asesorId: payload.asesorId,
            asesorNombre: payload.asesorNombre,
            razon: payload.razon,
          },
        },
        [clienteUserId, payload.asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('order.receipt.retry', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        receiptId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Reenvío de recibo',
        mensaje: `Se reenvió el recibo del pedido ${payload.orderNumero}`,
        usuarioId: payload.asesorId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
          receiptId: payload.receiptId,
        },
      });
    });

    eventBus.subscribe('custom_order.created', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
        itemsCount: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const adminIds = await this.findAdmins();
      if (clienteUserId) {
        await this.notify(
          {
            tipo: 'INFO',
            titulo: 'Solicitud creada',
            mensaje: `Se creó la solicitud ${payload.numeroSolicitud}`,
            modulo: 'PEDIDOS_PERSONALIZADOS',
            entityType: 'CUSTOM_ORDER',
            entityId: payload.customOrderId,
            action: 'CREATED',
            actorId: clienteUserId,
            targetUserId: clienteUserId,
            metadata: {
              customOrderId: payload.customOrderId,
              numeroSolicitud: payload.numeroSolicitud,
              clienteId: payload.clienteId,
              clienteNombre: payload.clienteNombre,
              asesorId: payload.asesorId,
              asesorNombre: payload.asesorNombre,
              itemsCount: payload.itemsCount,
            },
          },
          [clienteUserId, ...adminIds],
        );
      }

      if (payload.asesorId) {
        await this.notify(
          {
            tipo: 'INFO',
            titulo: 'Solicitud creada',
            mensaje: `El cliente ${payload.clienteNombre} creó la solicitud ${payload.numeroSolicitud}`,
            modulo: 'PEDIDOS_PERSONALIZADOS',
            entityType: 'CUSTOM_ORDER',
            entityId: payload.customOrderId,
            action: 'CREATED',
            actorId: clienteUserId ?? undefined,
            targetUserId: payload.asesorId,
            metadata: {
              customOrderId: payload.customOrderId,
              numeroSolicitud: payload.numeroSolicitud,
              clienteId: payload.clienteId,
              clienteNombre: payload.clienteNombre,
              asesorId: payload.asesorId,
              asesorNombre: payload.asesorNombre,
              itemsCount: payload.itemsCount,
            },
          },
          [payload.asesorId],
        );
      }
    });

    eventBus.subscribe('custom_order.submitted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        clienteId: string;
        clienteNombre: string;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Solicitud enviada',
          mensaje: `El cliente ${payload.clienteNombre} envió la solicitud ${payload.numeroSolicitud}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'CUSTOM_ORDER',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: clienteUserId ?? undefined,
          targetUserId: asesorId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
          },
        },
        [asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.started', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        authorId: string;
        authorRole: string;
        message: string;
        round: number;
      };

      const customOrder = await this.prisma.custom_orders.findUnique({
        where: { id: payload.customOrderId, deleted_at: null },
        select: { cliente_id: true, asesor_id: true },
      });

      if (!customOrder) return;

      const isAdminOrAsesor = ['ADMIN', 'ASESOR'].includes(payload.authorRole);
      const targetCustomerId = isAdminOrAsesor ? customOrder.cliente_id : customOrder.asesor_id;
      const targetUserId = isAdminOrAsesor ? await this.findUserIdForCustomer(targetCustomerId ?? '') : await this.findUserIdByAnyId(customOrder.asesor_id ?? '');
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Negociación iniciada',
          mensaje: `Se inició una negociación en la cotización: "${payload.message}"`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE_NEGOTIATION',
          entityId: payload.quoteId,
          action: 'NEGOTIATION_STARTED',
          actorId: payload.authorId,
          targetUserId: targetUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            authorId: payload.authorId,
            authorRole: payload.authorRole,
            round: payload.round,
          },
        },
        [targetUserId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.responded', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        authorId: string;
        authorRole: string;
        message: string;
        round: number;
        proposalData?: any;
      };

      const customOrder = await this.prisma.custom_orders.findUnique({
        where: { id: payload.customOrderId, deleted_at: null },
        select: { cliente_id: true, asesor_id: true },
      });

      if (!customOrder) return;

      const isAdminOrAsesor = ['ADMIN', 'ASESOR'].includes(payload.authorRole);
      const targetCustomerId = isAdminOrAsesor ? customOrder.cliente_id : customOrder.asesor_id;
      const targetUserId = isAdminOrAsesor ? await this.findUserIdForCustomer(targetCustomerId ?? '') : await this.findUserIdByAnyId(customOrder.asesor_id ?? '');
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Respuesta de negociación',
          mensaje: `Nueva respuesta en negociación: "${payload.message}"`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE_NEGOTIATION',
          entityId: payload.quoteId,
          action: 'NEGOTIATION_RESPONDED',
          actorId: payload.authorId,
          targetUserId: targetUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            authorId: payload.authorId,
            authorRole: payload.authorRole,
            round: payload.round,
            proposalData: payload.proposalData,
          },
        },
        [targetUserId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.accepted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        negotiationId: string;
        acceptedBy: string;
      };

      const customOrder = await this.prisma.custom_orders.findUnique({
        where: { id: payload.customOrderId, deleted_at: null },
        select: { cliente_id: true, asesor_id: true, numero: true },
      });

      if (!customOrder) return;

      const clienteUserId = await this.findUserIdForCustomer(customOrder.cliente_id ?? '');
      const asesorUserId = await this.findUserIdByAnyId(customOrder.asesor_id ?? '');
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Propuesta aceptada',
          mensaje: `El cliente aceptó la propuesta de negociación para la solicitud ${customOrder.numero}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE_NEGOTIATION',
          entityId: payload.negotiationId,
          action: 'NEGOTIATION_ACCEPTED',
          actorId: payload.acceptedBy,
          targetUserId: asesorUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            negotiationId: payload.negotiationId,
            acceptedBy: payload.acceptedBy,
          },
        },
        [asesorUserId, clienteUserId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.rejected', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        negotiationId: string;
        rejectedBy: string;
        reason?: string;
      };

      const customOrder = await this.prisma.custom_orders.findUnique({
        where: { id: payload.customOrderId, deleted_at: null },
        select: { cliente_id: true, asesor_id: true, numero: true },
      });

      if (!customOrder) return;

      const clienteUserId = await this.findUserIdForCustomer(customOrder.cliente_id ?? '');
      const asesorUserId = await this.findUserIdByAnyId(customOrder.asesor_id ?? '');
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'WARNING',
          titulo: 'Propuesta rechazada',
          mensaje: `El cliente rechazó la propuesta de negociación para la solicitud ${customOrder.numero}${payload.reason ? `. Razón: ${payload.reason}` : ''}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE_NEGOTIATION',
          entityId: payload.negotiationId,
          action: 'NEGOTIATION_REJECTED',
          actorId: payload.rejectedBy,
          targetUserId: asesorUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            negotiationId: payload.negotiationId,
            rejectedBy: payload.rejectedBy,
            reason: payload.reason,
          },
        },
        [asesorUserId, clienteUserId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('custom_order.converted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Solicitud convertida',
          mensaje: `La solicitud ${payload.numeroSolicitud} fue convertida al pedido ${payload.orderNumero}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'CUSTOM_ORDER',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: asesorId ?? undefined,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            orderId: payload.orderId,
            orderNumero: payload.orderNumero,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            total: payload.total,
          },
        },
        [clienteUserId, asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('customOrder.status.updated', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        previousStatus: string;
        newStatus: string;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'INFO',
          titulo: `Solicitud ${payload.numeroSolicitud} actualizada`,
          mensaje: `Estado cambiado de "${payload.previousStatus}" a "${payload.newStatus}"`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'CUSTOM_ORDER',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: asesorId ?? undefined,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            asesorId: payload.asesorId,
            asesorNombre: payload.asesorNombre,
          },
        },
        [clienteUserId, asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.generated', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        numeroCotizacion: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
        valorAnticipo: number;
        saldo: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Cotización generada',
          mensaje: `Se generó la cotización ${payload.numeroCotizacion} para la solicitud ${payload.numeroSolicitud}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'CREATED',
          actorId: asesorId ?? undefined,
          targetUserId: clienteUserId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            numeroCotizacion: payload.numeroCotizacion,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            total: payload.total,
            valorAnticipo: payload.valorAnticipo,
            saldo: payload.saldo,
          },
        },
        [clienteUserId, asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.accepted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        numeroCotizacion: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
        valorAnticipo: number;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Cotización aceptada',
          mensaje: `El cliente ${payload.clienteNombre} aceptó la cotización ${payload.numeroCotizacion}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: clienteUserId ?? undefined,
          targetUserId: asesorId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            numeroCotizacion: payload.numeroCotizacion,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            total: payload.total,
            valorAnticipo: payload.valorAnticipo,
          },
        },
        [asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.rejected', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        numeroCotizacion: string;
        clienteId: string;
        clienteNombre: string;
        motivoRechazo?: string;
      };

      const clienteUserId = await this.findUserIdForCustomer(payload.clienteId);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();
      await this.notify(
        {
          tipo: 'WARNING',
          titulo: 'Cotización rechazada',
          mensaje: `El cliente ${payload.clienteNombre} rechazó la cotización ${payload.numeroCotizacion}`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: clienteUserId ?? undefined,
          targetUserId: asesorId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            numeroSolicitud: payload.numeroSolicitud,
            numeroCotizacion: payload.numeroCotizacion,
            clienteId: payload.clienteId,
            clienteNombre: payload.clienteNombre,
            motivoRechazo: payload.motivoRechazo,
          },
        },
        [asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.started', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        authorId: string;
        authorRole: string;
        message: string;
        round: number;
      };

      const pedido = await this.prisma.custom_orders.findUnique({ where: { id: payload.customOrderId, deleted_at: null } }).catch(() => null);
      if (!pedido) return;

      const clienteUserId = await this.findUserIdForCustomer(pedido.cliente_id);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();

      const targetUser = payload.authorRole === 'CLIENTE' ? (asesorId ?? undefined) : (clienteUserId ?? undefined);
      const recipients = payload.authorRole === 'CLIENTE' ? [asesorId, ...adminIds].filter(Boolean) as string[] : [clienteUserId].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Nueva propuesta de negociación',
          mensaje: `Se ha enviado una nueva propuesta para la cotización ${payload.round}/3`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: payload.authorId,
          targetUserId: targetUser,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            round: payload.round,
            message: payload.message,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('quotation.negotiation.responded', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        authorId: string;
        authorRole: string;
        message: string;
        round: number;
        proposalData?: any;
      };

      const pedido = await this.prisma.custom_orders.findUnique({ where: { id: payload.customOrderId, deleted_at: null } }).catch(() => null);
      if (!pedido) return;

      const clienteUserId = await this.findUserIdForCustomer(pedido.cliente_id);
      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();

      const targetUser = payload.authorRole === 'CLIENTE' ? (asesorId ?? undefined) : (clienteUserId ?? undefined);
      const recipients = payload.authorRole === 'CLIENTE' ? [asesorId, ...adminIds].filter(Boolean) as string[] : [clienteUserId].filter(Boolean) as string[];

      await this.notify(
        {
          tipo: 'INFO',
          titulo: 'Respuesta en negociación',
          mensaje: `Nueva respuesta en la negociación de la cotización (ronda ${payload.round}/3)`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: payload.authorId,
          targetUserId: targetUser,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            round: payload.round,
            message: payload.message,
            proposalData: payload.proposalData,
          },
        },
        recipients,
      );
    });

    eventBus.subscribe('quotation.negotiation.accepted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        negotiationId: string;
        acceptedBy: string;
      };

      const pedido = await this.prisma.custom_orders.findUnique({ where: { id: payload.customOrderId, deleted_at: null } }).catch(() => null);
      if (!pedido) return;

      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'SUCCESS',
          titulo: 'Propuesta aceptada',
          mensaje: `El cliente aceptó la propuesta de negociación de la cotización`,
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: payload.acceptedBy,
          targetUserId: asesorId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            negotiationId: payload.negotiationId,
          },
        },
        [asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('quotation.negotiation.rejected', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        quoteId: string;
        negotiationId: string;
        rejectedBy: string;
        reason?: string;
      };

      const pedido = await this.prisma.custom_orders.findUnique({ where: { id: payload.customOrderId, deleted_at: null } }).catch(() => null);
      if (!pedido) return;

      const asesorId = await this.findAsesorForCustomOrder(payload.customOrderId);
      const adminIds = await this.findAdmins();

      await this.notify(
        {
          tipo: 'WARNING',
          titulo: 'Propuesta rechazada',
          mensaje: payload.reason ? `El cliente rechazó la propuesta: ${payload.reason}` : 'El cliente rechazó la propuesta de negociación',
          modulo: 'PEDIDOS_PERSONALIZADOS',
          entityType: 'QUOTE',
          entityId: payload.customOrderId,
          action: 'STATUS_CHANGED',
          actorId: payload.rejectedBy,
          targetUserId: asesorId ?? undefined,
          metadata: {
            customOrderId: payload.customOrderId,
            quoteId: payload.quoteId,
            negotiationId: payload.negotiationId,
            reason: payload.reason,
          },
        },
        [asesorId, ...adminIds].filter(Boolean) as string[],
      );
    });

    eventBus.subscribe('order.assigned', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        domiciliarioId: string;
        domiciliarioNombre: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Domiciliario asignado',
        mensaje: `Se asignó el domiciliario ${payload.domiciliarioNombre} al pedido ${payload.orderNumero}`,
        usuarioId: payload.domiciliarioId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId: payload.domiciliarioId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          domiciliarioId: payload.domiciliarioId,
          domiciliarioNombre: payload.domiciliarioNombre,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('order.updated', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        cambios: Record<string, unknown>;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pedido actualizado',
        mensaje: `El pedido ${payload.orderNumero} fue actualizado`,
        usuarioId: payload.clienteId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId: payload.clienteId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          cambios: payload.cambios,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('order.deleted', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Pedido eliminado',
        mensaje: `El pedido ${payload.orderNumero} fue eliminado`,
        usuarioId: payload.clienteId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'DELETED',
        actorId: payload.asesorId,
        targetUserId: payload.clienteId,
        metadata: {
          orderId: payload.orderId,
          orderNumero: payload.orderNumero,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('production_order.created', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        cantidad: number;
        estado: string;
        tallerId?: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Orden de producción creada',
        mensaje: `Se creó la orden de producción ${payload.referencia}`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'CREATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          cantidad: payload.cantidad,
          estado: payload.estado,
          tallerId: payload.tallerId,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('production_order.updated', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        cambios: Record<string, unknown>;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Orden de producción actualizada',
        mensaje: `La orden de producción ${payload.referencia} fue actualizada`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          cambios: payload.cambios,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('production_order.deleted', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Orden de producción eliminada',
        mensaje: `La orden de producción ${payload.referencia} fue eliminada`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'DELETED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('production_order.assigned', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        tallerId: string;
        tallerNombre: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Orden de producción asignada',
        mensaje: `La orden de producción ${payload.referencia} fue asignada al taller ${payload.tallerNombre}`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          tallerId: payload.tallerId,
          tallerNombre: payload.tallerNombre,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('production_progress.updated', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        avance: number;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Avance de producción actualizado',
        mensaje: `El avance de la orden ${payload.referencia} se actualizó al ${payload.avance}%`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'PRODUCTION_ORDER',
        entityId: payload.productionOrderId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          productionOrderId: payload.productionOrderId,
          referencia: payload.referencia,
          avance: payload.avance,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('workshop.created', async (event) => {
      const payload = event.payload as {
        workshopId: string;
        nombre: string;
        ciudad?: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Taller creado',
        mensaje: `Se creó el taller ${payload.nombre}`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'WORKSHOP',
        entityId: payload.workshopId,
        action: 'CREATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          workshopId: payload.workshopId,
          nombre: payload.nombre,
          ciudad: payload.ciudad,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('workshop.updated', async (event) => {
      const payload = event.payload as {
        workshopId: string;
        nombre: string;
        cambios: Record<string, unknown>;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Taller actualizado',
        mensaje: `El taller ${payload.nombre} fue actualizado`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'WORKSHOP',
        entityId: payload.workshopId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          workshopId: payload.workshopId,
          nombre: payload.nombre,
          cambios: payload.cambios,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('workshop.deleted', async (event) => {
      const payload = event.payload as {
        workshopId: string;
        nombre: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Taller eliminado',
        mensaje: `El taller ${payload.nombre} fue eliminado`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'WORKSHOP',
        entityId: payload.workshopId,
        action: 'DELETED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          workshopId: payload.workshopId,
          nombre: payload.nombre,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('control.created', async (event) => {
      const payload = event.payload as {
        controlId: string;
        produccionId: string;
        etapa: string;
        estado: string;
        cantidadTotal: number;
        creadoPorId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Control de prenda creado',
        mensaje: `Se creó un control de prenda en etapa ${payload.etapa}`,
        usuarioId: payload.creadoPorId,
        modulo: 'PRODUCTION',
        entityType: 'CONTROL_PRENDA',
        entityId: payload.controlId,
        action: 'CREATED',
        actorId: payload.creadoPorId,
        targetUserId: payload.creadoPorId,
        metadata: {
          controlId: payload.controlId,
          produccionId: payload.produccionId,
          etapa: payload.etapa,
          estado: payload.estado,
          cantidadTotal: payload.cantidadTotal,
          creadoPorId: payload.creadoPorId,
        },
      });
    });

    eventBus.subscribe('control.updated', async (event) => {
      const payload = event.payload as {
        controlId: string;
        produccionId: string;
        estado: string;
        etapa: string;
        creadoPorId: string;
        revisadoPorId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Control de prenda actualizado',
        mensaje: `Control de prenda en etapa ${payload.etapa} actualizado a ${payload.estado}`,
        usuarioId: payload.revisadoPorId,
        modulo: 'PRODUCTION',
        entityType: 'CONTROL_PRENDA',
        entityId: payload.controlId,
        action: 'UPDATED',
        actorId: payload.revisadoPorId,
        targetUserId: payload.creadoPorId,
        metadata: {
          controlId: payload.controlId,
          produccionId: payload.produccionId,
          estado: payload.estado,
          etapa: payload.etapa,
          creadoPorId: payload.creadoPorId,
          revisadoPorId: payload.revisadoPorId,
        },
      });
    });

    eventBus.subscribe('control.deleted', async (event) => {
      const payload = event.payload as {
        controlId: string;
        produccionId: string;
        etapa: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Control de prenda eliminado',
        mensaje: `Se eliminó un control de prenda en etapa ${payload.etapa}`,
        usuarioId: payload.usuarioId,
        modulo: 'PRODUCTION',
        entityType: 'CONTROL_PRENDA',
        entityId: payload.controlId,
        action: 'DELETED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          controlId: payload.controlId,
          produccionId: payload.produccionId,
          etapa: payload.etapa,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('supplier.created', async (event) => {
      const payload = event.payload as {
        supplierId: string;
        nombre: string;
        email?: string;
        telefono?: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Proveedor creado',
        mensaje: `Se creó el proveedor ${payload.nombre}`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'SUPPLIER',
        entityId: payload.supplierId,
        action: 'CREATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          supplierId: payload.supplierId,
          nombre: payload.nombre,
          email: payload.email,
          telefono: payload.telefono,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('supplier.updated', async (event) => {
      const payload = event.payload as {
        supplierId: string;
        nombre: string;
        cambios: Record<string, unknown>;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Proveedor actualizado',
        mensaje: `El proveedor ${payload.nombre} fue actualizado`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'SUPPLIER',
        entityId: payload.supplierId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          supplierId: payload.supplierId,
          nombre: payload.nombre,
          cambios: payload.cambios,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('supplier.deleted', async (event) => {
      const payload = event.payload as {
        supplierId: string;
        nombre: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Proveedor eliminado',
        mensaje: `El proveedor ${payload.nombre} fue eliminado`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'SUPPLIER',
        entityId: payload.supplierId,
        action: 'DELETED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          supplierId: payload.supplierId,
          nombre: payload.nombre,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('raw_material.created', async (event) => {
      const payload = event.payload as {
        rawMaterialId: string;
        nombre: string;
        stockActual: number;
        stockMinimo: number;
        unidadMedida?: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Insumo creado',
        mensaje: `Se creó el insumo ${payload.nombre}`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'RAW_MATERIAL',
        entityId: payload.rawMaterialId,
        action: 'CREATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          rawMaterialId: payload.rawMaterialId,
          nombre: payload.nombre,
          stockActual: payload.stockActual,
          stockMinimo: payload.stockMinimo,
          unidadMedida: payload.unidadMedida,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('raw_material.updated', async (event) => {
      const payload = event.payload as {
        rawMaterialId: string;
        nombre: string;
        cambios: Record<string, unknown>;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Insumo actualizado',
        mensaje: `El insumo ${payload.nombre} fue actualizado`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'RAW_MATERIAL',
        entityId: payload.rawMaterialId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          rawMaterialId: payload.rawMaterialId,
          nombre: payload.nombre,
          cambios: payload.cambios,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('raw_material.deleted', async (event) => {
      const payload = event.payload as {
        rawMaterialId: string;
        nombre: string;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Insumo eliminado',
        mensaje: `El insumo ${payload.nombre} fue eliminado`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'RAW_MATERIAL',
        entityId: payload.rawMaterialId,
        action: 'DELETED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          rawMaterialId: payload.rawMaterialId,
          nombre: payload.nombre,
          usuarioId: payload.usuarioId,
        },
      });
    });

    eventBus.subscribe('stock.movement.created', async (event) => {
      const payload = event.payload as {
        movementId: string;
        rawMaterialId: string;
        rawMaterialNombre: string;
        tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
        cantidad: number;
        nuevoStock: number;
        usuarioId: string;
      };

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Movimiento de stock',
        mensaje: `Movimiento de ${payload.tipo.toLowerCase()} de ${payload.cantidad} unidades en ${payload.rawMaterialNombre}. Stock actual: ${payload.nuevoStock}`,
        usuarioId: payload.usuarioId,
        modulo: 'STOCK',
        entityType: 'RAW_MATERIAL',
        entityId: payload.rawMaterialId,
        action: 'UPDATED',
        actorId: payload.usuarioId,
        targetUserId: payload.usuarioId,
        metadata: {
          movementId: payload.movementId,
          rawMaterialId: payload.rawMaterialId,
          rawMaterialNombre: payload.rawMaterialNombre,
          tipo: payload.tipo,
          cantidad: payload.cantidad,
          nuevoStock: payload.nuevoStock,
          usuarioId: payload.usuarioId,
        },
      }      );
    });

    eventBus.subscribe('custom_order.updated', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        cambios: Record<string, unknown>;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      const targetUserId = payload.asesorId || payload.clienteId;

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Solicitud modificada',
        mensaje: `La solicitud ${payload.numeroSolicitud} fue modificada`,
        usuarioId: targetUserId,
        modulo: 'PEDIDOS_PERSONALIZADOS',
        entityType: 'CUSTOM_ORDER',
        entityId: payload.customOrderId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId,
        metadata: {
          customOrderId: payload.customOrderId,
          numeroSolicitud: payload.numeroSolicitud,
          cambios: payload.cambios,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('custom_order.deleted', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      const targetUserId = payload.asesorId || payload.clienteId;

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Solicitud eliminada',
        mensaje: `La solicitud ${payload.numeroSolicitud} fue eliminada`,
        usuarioId: targetUserId,
        modulo: 'PEDIDOS_PERSONALIZADOS',
        entityType: 'CUSTOM_ORDER',
        entityId: payload.customOrderId,
        action: 'DELETED',
        actorId: payload.asesorId,
        targetUserId,
        metadata: {
          customOrderId: payload.customOrderId,
          numeroSolicitud: payload.numeroSolicitud,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('custom_order.payment.updated', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        cambios: Record<string, unknown>;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      const targetUserId = payload.asesorId || payload.clienteId;

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Pago de solicitud actualizado',
        mensaje: `Se actualizó la información de pago de la solicitud ${payload.numeroSolicitud}`,
        usuarioId: targetUserId,
        modulo: 'PEDIDOS_PERSONALIZADOS',
        entityType: 'CUSTOM_ORDER',
        entityId: payload.customOrderId,
        action: 'UPDATED',
        actorId: payload.asesorId,
        targetUserId,
        metadata: {
          customOrderId: payload.customOrderId,
          numeroSolicitud: payload.numeroSolicitud,
          cambios: payload.cambios,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });

    eventBus.subscribe('custom_order.reference.uploaded', async (event) => {
      const payload = event.payload as {
        customOrderId: string;
        numeroSolicitud: string;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
      };

      const targetUserId = payload.asesorId || payload.clienteId;

      await this.repo.create({
        tipo: 'INFO',
        titulo: 'Imagen de referencia cargada',
        mensaje: `Se cargó una imagen de referencia para la solicitud ${payload.numeroSolicitud}`,
        usuarioId: targetUserId,
        modulo: 'PEDIDOS_PERSONALIZADOS',
        entityType: 'CUSTOM_ORDER',
        entityId: payload.customOrderId,
        action: 'UPDATED',
        actorId: payload.clienteId,
        targetUserId,
        metadata: {
          customOrderId: payload.customOrderId,
          numeroSolicitud: payload.numeroSolicitud,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          asesorId: payload.asesorId,
          asesorNombre: payload.asesorNombre,
        },
      });
    });
  }
}
