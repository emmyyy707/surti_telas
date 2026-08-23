import { NotFoundError } from '../../../../shared/domain/errors';
import type { NotificationFilters, NotificationRepository } from '../../domain/repositories/NotificationRepository';
import type { EventBus } from '../../../../shared/application/events';

export class GetNotifications {
  constructor(private readonly repo: NotificationRepository) {}
  execute(filters?: NotificationFilters) {
    return this.repo.list(filters);
  }
}

export class GetNotificationById {
  constructor(private readonly repo: NotificationRepository) {}
  async execute(id: string) {
    const notification = await this.repo.getById(id);
    if (!notification) throw new NotFoundError('Notificación no encontrada');
    return notification;
  }
}

export class MarkNotificationAsRead {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string) {
    return this.repo.markAsRead(id);
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
  execute(id: string, changes: { titulo?: string; mensaje?: string; leida?: boolean }) {
    return this.repo.update(id, changes);
  }
}

export class DeleteNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class NotificationSubscriber {
  constructor(private readonly repo: NotificationRepository) {}

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

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Nuevo pedido creado',
        mensaje: `Pedido ${payload.orderNumero} de ${payload.clienteNombre} por $${payload.total.toLocaleString()} (${payload.itemsCount} ítems)`,
        usuarioId: payload.asesorId,
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
      });
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

      await this.repo.create({
        tipo: tipoMap[payload.newStatus] || 'INFO',
        titulo: `Pedido ${payload.orderNumero} actualizado`,
        mensaje: `Estado cambiado de "${payload.previousStatus}" a "${payload.newStatus}" para el cliente ${payload.clienteNombre}`,
        usuarioId: payload.asesorId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'STATUS_CHANGED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
        },
      });
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

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Pedido entregado',
        mensaje: `Pedido ${payload.orderNumero} entregado al cliente ${payload.clienteNombre} por $${payload.total}`,
        usuarioId: payload.asesorId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'DELIVERED',
        actorId: payload.asesorId,
        targetUserId: payload.asesorId,
        metadata: {
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          total: payload.total,
        },
      });
    });

    eventBus.subscribe('order.canceled', async (event) => {
      const payload = event.payload as {
        orderId: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
        items: { productId: string; productRef: string; cantidad: number }[];
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Pedido cancelado',
        mensaje: `Pedido cancelado del cliente ${payload.clienteNombre} por $${payload.total}`,
        usuarioId: payload.clienteId,
        modulo: 'ORDERS',
        entityType: 'ORDER',
        entityId: payload.orderId,
        action: 'CANCELLED',
        actorId: payload.clienteId,
        targetUserId: payload.clienteId,
        metadata: {
          clienteId: payload.clienteId,
          clienteNombre: payload.clienteNombre,
          total: payload.total,
          items: payload.items,
        },
      });
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
  }
}
