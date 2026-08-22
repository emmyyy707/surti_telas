
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

export function registerAuditEventHandlers(): void {
  const events = [
    'order.created',
    'order.status.updated',
    'order.delivered',
    'order.canceled',
    'stock.below_minimum',
    'production.completed',
    'user.login',
    'user.permission.changed',
    'report.exported',
    'delivery.updated',
    'commission.calculated',
    'alert.triggered',
    'auth.password_reset.attempted',
    'auth.password_reset.requested',
  ];

  for (const eventType of events) {
    eventBus.subscribe(eventType, async (event: unknown) => {
      try {
        const typed = event as { occurredAt?: Date; payload?: Record<string, unknown> };
        const payload = typed.payload ?? {};
        const metadata: Record<string, unknown> = {};

        if (eventType === 'order.status.updated') {
          metadata.previousStatus = payload.previousStatus ?? null;
          metadata.newStatus = payload.newStatus ?? null;
        }

        if (eventType === 'auth.password_reset.attempted' || eventType === 'auth.password_reset.requested') {
          metadata.success = payload.success ?? null;
          metadata.reason = payload.reason ?? null;
          metadata.email = payload.email ?? null;
        }

        await prisma.auditLog.create({
          data: {
            usuarioId: (payload.userId as string | undefined) ?? 'system',
            accion: (payload.action as string | undefined) ?? eventType,
            modulo: 'auth',
            referenciaId: (payload.resourceId as string | undefined) ?? (payload.email as string | undefined) ?? '',
            ip: payload.ipAddress as string | undefined ?? (payload.ip as string | undefined),
            userAgent: payload.userAgent as string | undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: metadata as any,
          },
        });
      } catch (err) {
        logger.error('[Audit] Failed to persist audit event', {
          accion: eventType,
          error: (err as Error).message,
        });
      }
    });
  }

  logger.info('[Audit] Registered ' + events.length + ' event handlers');
}
