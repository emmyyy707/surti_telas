import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

const CUSTOM_ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  CANCELADO: 'Cancelado',
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
  VENCIDO: 'Vencido',
};

export const registerCustomOrderNotificationSubscriber = () => {
  eventBus.subscribe('customOrder.status.updated', async (event) => {
    const payload = (event as any).payload as {
      customOrderId: string;
      numeroSolicitud: string;
      previousStatus: string;
      newStatus: string;
      clienteId: string;
      clienteNombre: string;
      asesorId?: string | null;
      asesorNombre?: string | null;
    };

    const titulo = `Solicitud ${payload.numeroSolicitud} actualizada`;
    const mensaje = `Estado cambiado de "${CUSTOM_ORDER_STATUS_LABELS[payload.previousStatus] ?? payload.previousStatus}" a "${CUSTOM_ORDER_STATUS_LABELS[payload.newStatus] ?? payload.newStatus}"`;

    if (payload.clienteId) {
      await prisma.notification.create({
        data: {
          tipo: 'INFO',
          titulo,
          mensaje,
          usuarioId: payload.clienteId,
          modulo: 'pedidos-personalizados',
          referenciaId: payload.customOrderId,
        },
      });
    }

    if (payload.asesorId) {
      await prisma.notification.create({
        data: {
          tipo: 'INFO',
          titulo,
          mensaje,
          usuarioId: payload.asesorId,
          modulo: 'pedidos-personalizados',
          referenciaId: payload.customOrderId,
        },
      });
    }
  });
};
